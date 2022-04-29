import React, { Component } from "react";
import "./App.css";
import Auction from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";


const CONTRACT_ADDRESS = "0x859fEb36209D31CcdfF0e6a662f28c4c96cEBd25"
const CONTRACT_ABI = require("./contracts/Auction.json").abi

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the network ID
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Auction.networks[networkId];

      // Check if the Smart Contract is deployed on Network with ID: XY
      if (deployedNetwork == undefined) {
        // alert("Por favor, conectate a Ganache para continuar utilizando la aplicacion");
        this.setState({ web3, accounts, networkId })
        return;
      }

      // Create the Smart Contract instance
      const instance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, networkId, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  componentDidUpdate() {
    this.handleMetamaskEvent()
    this.handleContractEvent()
  }

  // --------- METAMASK EVENTS ---------
  handleMetamaskEvent = async () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      alert("Incoming event from Metamask: Account changed")
      window.location.reload()
    })

    window.ethereum.on('networkChanged', function (networkId) {
      // Time to reload your interface with the new networkId
      alert("Incoming event from Metamask: Network changed")
      window.location.reload()
    })
  }

  switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: this.state.web3.utils.toHex(137)
          }
        ]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: this.state.web3.utils.toHex(137),
                chainName: 'Polygon',
                rpcUrls: ['https://polygon-rpc.com'] /* ... */,
              },
            ],
          });
        } catch (addError) {
          console.log(addError)
        }
      }
    }
  }

  // --------- SMART CONTRACT EVENTS ---------
  handleContractEvent = async () => {
    if (!this.state.contract) return
    this.state.contract.events.Status([])
      .on("connected", function (subscriptionId) {
        console.log("New subscription with ID: " + subscriptionId)
      })
      .on('data', function (event) {
        console.log("New event:")
        console.log(event)
        alert("New Highest BID 🤑 💰 💸")
      })
    // this.state.contract.once("Status",function(error, event){ console.log(event); });
  }



  // BID FUNCTION
  bid = async () => {
    const { accounts, contract } = this.state;

    // Bid at an auction for X value
    await contract.methods.bid().send({ from: accounts[0], value: this.state.value });

    // Get the new values: highest price and bidder, and the status of the auction
    const highestPrice = await contract.methods.getHighestPrice().call();
    const highestBidder = await contract.methods.getHighestBidder().call();
    const isActive = await contract.methods.isActive().call();

    // Update state with the result.
    this.setState({ isActive: isActive, highestPrice, highestBidder });
  };

  // STOP AUCTION FUNCTION
  stopAuction = async () => {
    const { accounts, contract } = this.state;

    // Stop the auction
    await contract.methods.stopAuction().send({ from: accounts[0] });

    // Get the new values: isActive and newOwner
    const isActive = await contract.methods.isActive().call();
    const newOwner = await contract.methods.newOwner().call();

    // Update state with the result.
    this.setState({ isActive, newOwner });
  }

  // GET AUCTION INFORMATION FUNCTION
  getAuctionInformation = async () => {
    const { accounts, contract } = this.state;

    // Get the auction information
    const response = await contract.methods.getAuctionInfo().call({ from: accounts[0] });
    this.setState({ auctionInfo: response })

    // Get the highest price and bidder, and the status of the auction
    const highestPrice = await contract.methods.getHighestPrice().call();
    const highestBidder = await contract.methods.getHighestBidder().call();
    const basePrice = await contract.methods.getBasePrice().call();
    const originalOwner = await contract.methods.originalOwner().call();
    const newOwner = await contract.methods.newOwner().call();
    const isActive = await contract.methods.isActive().call();
    console.log(isActive)
    this.setState({ highestPrice, highestBidder, basePrice, originalOwner, newOwner, isActive })
  }


  // ------- SIGN WITH METAMASK ------
  signMessage = async () => {
    const { accounts, web3 } = this.state;
    var signature = await web3.eth.personal.sign("Bid 20 Ether", accounts[0])
    console.log("The signature is: " + signature);
    this.setState({ signature });
    // this.recoverSigner();
  }

  // ------- RECOVER SIGNER ADDRES ------
  recoverSigner = async () => {
    const { accounts, web3 } = this.state;
    var signer = await this.state.web3.eth.personal.ecRecover("Bid 20 Ether", this.state.signature)
    console.log(signer)
    this.setState({ signer })
  }

  render() {

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Welcome to the auction,</h1>

        {/* Context Information: Account & Network */}
        <div className="Context-information">
          <p> Your address: {this.state.accounts[0]}</p>
          <p> Network connected: {this.state.networkId}</p>
          {this.state.networkId !== 1337 && <p id="inline">This DAPP is currently working on GANACHE, please press the button</p>}
          {this.state.networkId !== 1337 && <button onClick={this.switchNetwork}>Switch to Ganache</button>}
        </div>

        {/* Auction information */}
        <h2 id="inline">Auction information</h2>
        <button id="button-call" onClick={this.getAuctionInformation}> GET AUCTION INFO</button>
        {
          this.state.auctionInfo &&
          <div className="Auction-information">
            <div className="Auction-information-img">
              {/* Auction Image */}
              <img src="https://bafybeifzm6xqduwgl6lwjyabj2v5qwduwqgotr6hjj5cu632ldtu6zbw4a.ipfs.nftstorage.link/"></img>

              {/* Auction Description */}
              <h3>{this.state.auctionInfo[0]}</h3>

              {/* Auction Status */}
              {this.state.isActive ? <p>The auction is still active!! 🤩 🤩</p> : <p><b>The auction is not longer active </b>😭 😭</p>}
            </div>

            <div className="Auction-information-text">
              {/* Basic Information */}
              <p><b>Created at:</b> {this.state.auctionInfo[1]}</p>
              <p><b>Duration:</b> {this.state.auctionInfo[2]}</p>

              {/* More information */}
              {this.state.highestBidder && <p><b>Highest Bidder:</b> {this.state.highestBidder}</p>}
              {this.state.highestPrice && <p><b>Highest Price:</b> {this.state.highestPrice} = {this.state.web3.utils.fromWei(this.state.highestPrice, 'ether')} ether</p>}
              {this.state.basePrice && <p><b>Base price:</b> {this.state.basePrice}</p>}
              {this.state.originalOwner && <p><b>Original Owner:</b> {this.state.originalOwner}</p>}
              {this.state.newOwner && <p><b>New Owner:</b> {this.state.newOwner}</p>}
            </div>
          </div>
        }

        {/* Auction actions */}
        <h2>Auction actions</h2>
        <div className="Auction-actions">
          {/* Input & Button to bid */}
          <input placeholder="Insert value in wei" onChange={(e) => this.setState({ value: e.target.value })}></input>
          <button id="button-send" onClick={this.bid}>BID</button>

          {/* Button to stop auction */}
          <button id="button-send" onClick={this.stopAuction}>STOP AUCTION</button>

          {/* Helper to convert wei to ether */}
          {this.state.value && <p>You're gonna bid: {this.state.web3.utils.fromWei(this.state.value, 'ether')} ether</p>}
        </div>

        <br /><br /><br /><br />

        {/* Button to sign a message (i.e. sign the bid) */}
        <button onClick={this.signMessage}>SIGN MESSAGE</button>
        <div style={{ overflowWrap: "anywhere" }}>
          {this.state.signature && <p>Signed message: {this.state.signature}</p>}
          {this.state.signer && <p>Signer address: {this.state.signer}</p>}
        </div>
        <br /><br /><br /><br />

      </div >
    );
  }
}

export default App;
