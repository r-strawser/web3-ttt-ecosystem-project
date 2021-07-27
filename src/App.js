import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import CallViewMethodButton from './components/CallViewMethodButton';
import ConnectToMetamaskButton from './components/ConnectToMetamaskButton';
// Update contract.abi.json to contain your contract's ABI
import Web3NFT from './abis/Web3NFT.json';
import useConnection from './hooks/Connection';
import axios from 'axios';

// Modify this to be your contract's address
const contractAddress = '0xbB37f3737e2bDE08ACb113c22F446F8f439cD98E';
//const contractAddress = '0x3620efB8C21A1332A20854f6F24392B981b0BcF1';

if (window.ethereum) {
  console.log("window.eth")
} else {
  console.log("no window.eth")
  alert("No MetaMask detected, the website will crash")
}

let initialState = [];

function App() {
  // Custom React hook that listens to MetaMask events
  // Check it out in ./hooks/Connection.js
  const { isConnected, address } = useConnection();
  const [nfts, setNfts] = useState(initialState);
  const [loadingState, setLoadingState] = useState('not-loaded');


  // A few state variables just to demonstrate different functionality of the ethers.js library
  const [owner, setOwner] = useState('');
  const [balance, setBalance] = useState('');



  useEffect(() => {
    if (isConnected) {

      if(address != null) {
        alert("connected to: "+address)
        fetchNFTs()
      }

      
    }
  }, [isConnected, address]);

  async function fetchNFTs() {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()


    const contract = new ethers.Contract(contractAddress, Web3NFT.abi, signer)
    
    
    const addressBalance = await contract.balanceOf(address)
    console.log("address balance: "+addressBalance)
    const data = await contract.getTokensOfOwner(address)
    console.log("IDs of tokens I own: "+data)


    
    const items = await Promise.all(data.map(async i => {
        const tokenUri = await contract.tokenURI(i.toNumber())
        console.log("token uri: "+tokenUri)
        const meta = await axios.get(tokenUri)
        let item = {
          tokenId: i.toNumber(),
          name: meta.data.name,
          description: meta.data.description,
          image: meta.data.image
        }

        console.log("TESTING Item")
        console.log("tokenId: "+item.tokenId)
        console.log("name: "+item.name)
        console.log("desription: "+item.description)
        console.log("image: "+item.image)

        return item

    }))
    setNfts(items)
    setLoadingState('loaded')

  }



  return (

    <>


    <div className="NFTS">
      {nfts.map((nft, i) => (
        <p key={i}>{JSON.stringify(nft)}</p>
      ))}
    </div>


    <div>
      <ConnectToMetamaskButton/>
      <div className="container">
      <div className="row">
      <div className="container">
      <div className="row">

      {
        nfts.map((nft, i) => (
          <div key={i} className="col"><div key={i} className="card">
            <a href={nft.external_url}>
            
              <img
              src={nft.image}
              width="300px"
              height="300px"/>

            </a>
              <div className="card-body">
            <h5 className="card-title">{nft.name}</h5>
            <p className="card-text">{nft.description}</p>
            </div>
            
            </div>
            </div>

        ))
      }

      </div>
      </div>
      </div>
      </div>
    </div>
    </>
    
  );
}

export default App;
