/**
 * A simple nodejs script which launches an orbitdb instance and creates a db
 * with a single record.
 *
 * To run from the terminal:
 *
 * ```bash
 * node index.js
 * ```
 * or
 * ```bash
 * node index.js /orbitdb/<hash>
 * ```
 */
import { createHelia } from "helia";
import { createOrbitDB, OrbitDBAccessController } from "@orbitdb/core";
import { createLibp2p } from "libp2p";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { yamux } from "@chainsafe/libp2p-yamux";
import { tcp } from "@libp2p/tcp";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { LevelBlockstore } from "blockstore-level";
import fs from "fs";
import readline from "readline";

// Set up libp2p and IPFS
const libp2pOptions = {
  peerDiscovery: [mdns()],
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/0"],
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    pubsub: gossipsub({ emitSelf: true }),
  },
};

// Create the terminal reader interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// only supports creation of database or connecting to one remote database
const id = process.argv.length > 2 ? 2 : 1;

// Generate a new id for the peer, based on the directory name of the previous peer
const getNewId = (currentId) => {
  let newId = currentId;
  if (process.argv.length > 2) {
    while (fs.existsSync(`./storage/orbitdb/${newId}`)) {
      newId += 1;
    }
  }
  return newId;
};

const _newId = getNewId(id);

console.log(`I'm peer: ${_newId}`);

const blockstore = new LevelBlockstore(`./storage/ipfs/${_newId}`);

const libp2p = await createLibp2p(libp2pOptions);

const ipfs = await createHelia({ libp2p, blockstore });

const orbitdb = await createOrbitDB({
  ipfs,
  id: `nodejs-${_newId}`,
  directory: `./storage/orbitdb/${_newId}`,
});

let db;

const askQuestion = (_newId) => {
  // Ask the user to input messages
  rl.question("Type a key: ", (key) => {
    rl.question("Type a value: ", async (value) => {
      await db.put(key, value);

      if (key === "exit" || value === "exit") {
        // Close the readline interface and end the process
        rl.close();
        await db.close();
        await orbitdb.stop();
        await ipfs.stop();
        process.exit(0);
      } else {
        // Print the content of the database after each entry
        console.log("Current database content:");
        console.log(await db.all());

        askQuestion(_newId);
      }
    });
  });
};

const printDB = async () => {
  console.log("Current database content:");
  console.log(await db.all());
}

// Connect to a remote database if an address is provided
if (process.argv.length > 2) {
  const remoteDBAddress = process.argv.pop();
  db = await orbitdb.open(remoteDBAddress, { type: "keyvalue" });

  // call the printDB function every 10 seconds
  setInterval(printDB, 10000);

// Create a new database if no address is provided
} else {
  const dbName = `obu_${_newId}`;
  db = await orbitdb.open(dbName, {
    create: true,
    type: "keyvalue",
    AccessController: OrbitDBAccessController({ write: ["*"] }),
    replicate: true,
  });

  console.log(`Your database name: ${dbName}, address: ${db.address.toString()}`);

  askQuestion(_newId);
}

process.on("SIGINT", async () => {
  console.log("exiting...");

  await db.close();
  await orbitdb.stop();
  await ipfs.stop();
  process.exit(0);
});
