// Import the necessary libraries
const Web3 = require('web3');
const WebSocket = require('ws');

// Set up the WebSocket connection to the Ethereum network
const web3 = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/3364173eb19745ab85dce2d5f0b4cd21');
const ws = new WebSocket('wss://api.etherscan.io/wshandler');

// Define the NFT contract address and ABI
const nftContractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
const nftContractABI = [{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];

// Set up the event listeners for the WebSocket stream
ws.addEventListener('open', function () {
  ws.send(JSON.stringify({ event: 'txlist', address: nftContractAddress }));
});

ws.addEventListener('message', async function (event) {
  const data = JSON.parse(event.data);
  
  // Filter out messages that are not NFT transfer transactions
  if (data.type !== 'transfer' || data.tokenType !== 'ERC721') {
    return;
  }
  
  // Parse the transaction hash and get the transaction details from the blockchain
  const txHash = data.hash;
  const tx = await web3.eth.getTransaction(txHash);
  
  // Parse the input data from the transaction and extract the transfer details
  const inputData = tx.input;
  const contract = new web3.eth.Contract(nftContractABI, nftContractAddress);
  const transferDetails = await contract.methods.transferFrom.decodeParameters(['address', 'address', 'uint256'], inputData.slice(10));
  
  // Extract the transfer price and token details from the transfer details
  const transferPrice = web3.utils.fromWei(tx.value, 'ether');
  const tokenID = transferDetails[2].toString();
  
  // Log the transfer details
  console.log(`NFT transfer details - Price: ${transferPrice} ETH, Token ID: ${tokenID}`);
});
