import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { createOrbitDB, IPFSAccessController } from '@orbitdb/core'
import { LevelBlockstore } from 'blockstore-level'
//import { Libp2pOptions } from './config/libp2p.js'
import pkg from './config/libp2p.js';
const { Libp2pOptions } = pkg;

const main = async () => {
  // create a random directory to avoid OrbitDB conflicts.
  let randDir = (Math.random() + 1).toString(36).substring(2)
    
  const blockstore = new LevelBlockstore(`./${randDir}/ipfs/blocks`)
  const libp2p = await createLibp2p(Libp2pOptions)
  const ipfs = await createHelia({ libp2p, blockstore })

  const orbitdb = await createOrbitDB({ ipfs, directory: `./${randDir}/orbitdb` })

  let db

  if (process.argv[2]) {
    db = await orbitdb.open(process.argv[2])
  } else {
    // When we open a new database, write access is only available to the 
    // db creator. If we want to allow other peers to write to the database,
    // they must be specified in IPFSAccessController write array param. Here,
    // we simply allow anyone to write to the database. A more robust solution
    // would use the OrbitDBAccessController to provide mutable, "fine-grain"
    // access using grant and revoke.
    db = await orbitdb.open('my-db', { AccessController: IPFSAccessController({ write: ['*']}) })
    
    // Copy this output if you want to connect a peer to another.
    console.log('my-db address', '(copy my db address and use when launching peer 2)', db.address)
  }

  db.events.on('update', async (entry) => {
    // what has been updated.
    console.log('update', entry.payload.value)
  })
  
  if (process.argv[2]) {
    await db.add('hello from second peer')
    await db.add('hello again from second peer')
  } else {
    // write some records
    await db.add('hello from first peer')
    await db.add('hello again from first peer')    
  }
  // Clean up when stopping this app using ctrl+c
  process.on('SIGINT', async () => {
      // print the final state of the db.
      console.log((await db.all()).map(e => e.value))
      // Close your db and stop OrbitDB and IPFS.
      await db.close()
      await orbitdb.stop()
      await ipfs.stop()

      process.exit()
  })
}

main()
