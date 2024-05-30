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

/*
  #####################################
  ## Initiating the OrbitDB instance ##
  #####################################
*/
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

// Get the environment variable for the peer id
const obuId = process.env.OBU_ID;

console.log(`I'm obu_${obuId}`);

const blockstore = new LevelBlockstore(`./storage/ipfs/${obuId}`);

const libp2p = await createLibp2p(libp2pOptions);

const ipfs = await createHelia({ libp2p, blockstore });

const orbitdb = await createOrbitDB({
  ipfs,
  id: `nodejs-${obuId}`,
  directory: `./storage/orbitdb/${obuId}`,
});

// Create a key-value pair database
const dbName = `obu_${obuId}`;
let db = await orbitdb.open(dbName, {
  create: true,
  type: "keyvalue",
  AccessController: OrbitDBAccessController({ write: ["*"] }),
  replicate: true,
});

// create a file named hash with the db address inside
fs.mkdirSync(`./storage/hash/${obuId}`, { recursive: true });
fs.writeFileSync(`./storage/hash/${obuId}/hash.txt`, db.address.toString());

console.log(`My database name is ${dbName} and address: ${db.address.toString()}`);

// Add a record to the database
const hash = await db.put('key', 'value')

/*
  ############################################################
  ## Setting up the API server for connectivity with Python ##
  ############################################################
*/



/*
  ##########################################
  ## End of life for the OrbitDB instance ##
  ##########################################
*/
process.on("SIGINT", async () => {
  console.log("exiting...");

  await db.close();
  await orbitdb.stop();
  await ipfs.stop();
  process.exit(0);
});
