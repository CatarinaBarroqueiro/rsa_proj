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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const id = process.argv.length > 2 ? 2 : 1;

const getNewId = (currentId) => {
  let newId = currentId;
  if (process.argv.length > 2) {
    while (fs.existsSync(`./orbitdb/${newId}`)) {
      newId += 1;
    }
  }
  return newId;
};

const _newId = getNewId(id);

const blockstore = new LevelBlockstore(`./ipfs/${_newId}`);

const libp2p = await createLibp2p(libp2pOptions);

const ipfs = await createHelia({ libp2p, blockstore });

const orbitdb = await createOrbitDB({
  ipfs,
  id: `nodejs-${_newId}`,
  directory: `./orbitdb/${_newId}`,
});

let db;

const askQuestion = (_newId) => {
  // Ask the user to input messages
  rl.question("Type a message to send: ", async (message) => {
    await db.add({ from: _newId, message });

    if (message === "exit") {
      // Close the readline interface and end the process
      rl.close();
      await db.close();
      await orbitdb.stop();
      await ipfs.stop();
      process.exit(0);
    } else {
      // Print the content of the database after each message
      console.log("Current database content:");
      console.log(await db.all());

      askQuestion(_newId);
    }
  });
};

if (process.argv.length > 2) {
  const remoteDBAddress = process.argv.pop();
  db = await orbitdb.open(remoteDBAddress);

  // Listen for incoming messages
  db.events.on("update", (event) => {
    const latestMessage = event.payload.value;

    process.stdout.write("\r");

    if (latestMessage.from !== _newId) {
      console.log(
        `Received message from peer ${latestMessage.from}: ${latestMessage.message}\n`
      );
    }

    askQuestion(_newId);
  });

  askQuestion(_newId);
} else {
  db = await orbitdb.open("chat-app", {
    AccessController: OrbitDBAccessController({ write: ["*"] }),
    replicate: true,
  });

  console.log(`Your database address: ${db.address.toString()}`);

  // Listen for incoming messages
  db.events.on("update", (event) => {
    const latestMessage = event.payload.value;

    process.stdout.write("\r");

    if (latestMessage.from !== _newId) {
      console.log(
        `Received message from peer ${latestMessage.from}: ${latestMessage.message}\n`
      );
    }

    askQuestion(_newId);
  });

  askQuestion(_newId);
}

process.on("SIGINT", async () => {
  console.log("exiting...");

  await db.close();
  await orbitdb.stop();
  await ipfs.stop();
  process.exit(0);
});
