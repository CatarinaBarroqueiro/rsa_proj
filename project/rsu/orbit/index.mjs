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
import axios from "axios";

/*
  #####################################
  ## Initiating the OrbitDB instance ##
  #####################################
*/
// Dictionary to store remote OrbitDB databases
const remoteOrbitdbs = {};
const remoteDatabases = {};
const remoteLastSeq = {};

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
const rsuId = process.env.RSU_ID;
//console.log(`I'm obu_${obuId}`);


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
    let remoteDB = await remoteOrbitdb.open(hash);
    remoteOrbitdbs[id] = remoteOrbitdb;
    remoteDatabases[id] = remoteDB;
    remoteLastSeq[id] = 0; // Initialize the last known sequence number

    // Print the content of the database after each message
    //console.log(`Current content of remote database ${id}:`);
    //console.log(await remoteDB.all());

    console.log(`[Orbit] Connected to remote OrbitDB with ID ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[Orbit] Error connecting to remote OrbitDB: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to post new entries to an external API
const postNewEntry = async (id, seq, entry) => {
  const { obu, event, latitude, longitude } = entry.value;
  const dataToPost = {
    obu,
    latitude,
    longitude,
    event
  };

  try {
    const response = await axios.post('http://192.168.68.111:3000/history', dataToPost);
    console.log(`Successfully posted entry ${seq} to external API:`);
  } catch (error) {
    console.error(`Failed to post entry ${seq} to external API:`, error.message);
  }
};


// Function to check and print new records every 5 seconds
const checkAndPrintUpdates = async () => {
  // Print the number of records in remoteDatabases
  //console.log(`[Orbit] Number of remote databases: ${Object.keys(remoteDatabases).length}`);
  for (const [id, db] of Object.entries(remoteDatabases)) {
    try { 
      // wait 1 second
      await new Promise(resolve => setTimeout(resolve, 2000));

      //console.log(`[Orbit] Current content of remote database ${id}:`);
      //console.log(await db.all());
      const allEntries = await db.all();
      const entries = Object.entries(allEntries).sort((a, b) => a[0] - b[0]); // Sort by sequence number
      const lastSeq = remoteLastSeq[id];
      const newEntries = entries.filter(([seq]) => seq > lastSeq);
      if (newEntries.length > 0) {
        console.log(`New entries in remote database ${id}:`);
        for (const [seq, entry] of newEntries) {
          console.log(`Seq: ${seq}, Value: ${JSON.stringify(entry)}`);
          await postNewEntry(id, seq, entry); // Post the new entry to the external API
        }
        remoteLastSeq[id] = Math.max(...newEntries.map(([seq]) => seq));
      }

    } catch (error) {
      console.error(`[Orbit] Error accessing remote OrbitDB ${id}: ${error.message}`);
    }
  }
};


// Start checking for updates every 5 seconds
setInterval(checkAndPrintUpdates, 5000);

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