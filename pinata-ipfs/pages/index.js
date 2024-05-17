import { useState } from "react";

import Head from "next/head";
import styles from "@/styles/Home.module.css";
import axios from "axios";


export default function Home() {
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  async function upload() {
    const formData = new FormData()
    formData.append("file", image);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      { 
        headers : {
          'pinata_api_key' : `${process.env.API_KEY}`,
          'pinata_api_secret' : `${process.env.API_SECRET}`,
          "Content-Type" : "multipart/form-data"
        }
      }

      );

      return `ipfs://${response.data.IpfsHash}`;
  }


  function btnUploadclick(){
    setMessage("Uploadinggggg  .....");
    upload()
      .then(result => setMessage(result))
      .catch(err => setMessage(err.message));
  }

  function OnFileChange(evt){
    if(evt.target.files){
      setImage(evt.target.files[0]);
    }
  }

    return (
      <>
          <Head>
        <title> Pinata IPFS </title>
        <meta name="description" content="Pinata IPFS"/>
      </Head>
      <main>
        <div>
          <input type="file" onChange={OnFileChange}></input>
          <button onClick={btnUploadclick}>upload</button>
        </div>
        {message}
      </main>
      </>
    );
  }
