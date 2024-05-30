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
import express from "express";

/*
  #####################################
  ## Initiating the OrbitDB instance ##
  #####################################
*/
// Dictionary to store remote OrbitDB databases
const remoteOrbitdbs = {};
const remoteDatabases = {};

// Set up libp2p and IPFS
const setupOrbitDB = async (obuId) => {
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

  const blockstore = new LevelBlockstore(`./storage/ipfs/${obuId}`);
  const libp2p = await createLibp2p(libp2pOptions);
  const ipfs = await createHelia({ libp2p, blockstore });
  const orbitdb = await createOrbitDB({
    ipfs,
    id: `nodejs-${obuId}`,
    directory: `./storage/orbitdb/${obuId}`,
  });

  return orbitdb;
};

// Get the environment variable for the peer id
const obuId = process.env.OBU_ID;
//console.log(`I'm obu_${obuId}`);

// Create a key-value pair database
const dbName = `obu_${obuId}`;
const myOrbitdb = await setupOrbitDB(obuId);
let db = await myOrbitdb.open(dbName, {
  create: true,
  type: "keyvalue",
  AccessController: OrbitDBAccessController({ write: ["*"] }),
  replicate: true,
});

// create a file named hash with the db address inside
fs.mkdirSync(`./storage/hash/${obuId}`, { recursive: true });
fs.writeFileSync(`./storage/hash/${obuId}/hash.txt`, db.address.toString());

console.log(`[Orbit] My database name is ${dbName} and address: ${db.address.toString()}`);

const hash = await db.put('local', 'put')



/*
  ############################################################
  ## Setting up the API server for connectivity with Python ##
  ############################################################
*/

const app = express();
const PORT = process.env.PYTHON_NODE_API_PORT;

// Middleware for parsing JSON bodies
app.use(express.json());

// Endpoint to add a hash
app.post("/addHash", async (req, res) => {
  const { id, hash } = req.body;
  if (!id || !hash) {
    return res.status(400).json({ error: "Missing id or hash in request body" });
  }

  try {
    // Connect to the remote OrbitDB database using the provided hash
    let remoteOrbitdb = await setupOrbitDB(id);
    let remoteDB = await remoteOrbitdb.open(hash)
    remoteOrbitdbs[id] = remoteOrbitdb;
    remoteDatabases[id] = remoteDB;
    //const putHash = await remoteDB.put('remote', 'put')
    //// Print the content of the database after each message
    //console.log(`Current content of remote database ${id}:`);
    //console.log(await remoteDB.all());

    console.log(`[Orbit] Connected to remote OrbitDB with ID ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[Orbit] Error connecting to remote OrbitDB: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to add data
app.post("/addData", async (req, res) => {
  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No seq or data received" });
  }
  const { seq, obu, latitude, longitude, event } = data; // Destructuring assignment

  try {
    // Put the received data into our local OrbitDB database
    await db.put(seq, { obu, latitude, longitude, event });

    // Print the content of the database after each message
    //console.log("Current database content:");
    //console.log(await db.all());
    
    console.log(`[Orbit] Stored data with seq ${seq} in local OrbitDB`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[Orbit] Error storing data in local OrbitDB: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }

});

// Start the server
app.listen(PORT, () => {
  console.log(`[Orbit] Server is running on port ${PORT}`);
});


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
