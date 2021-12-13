var fetch = require('fetch')
var OracleContract = require('./build/contracts/CMCOracle.json')
var contract = require('@truffle/contract');
var HDWalletProvider = require('@truffle/hdwallet-provider');
var dotenv = require('dotenv');

dotenv.config();

var provider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  providerOrUrl: process.env.INFURA_PROJECT_ID ? `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}` : 'http://localhost:8545'
});

const oracleContractAddress = process.env.ORACLE_ADDRESS;

var Web3 = require('web3');
var web3 = new Web3(provider);

var web3Wss = new Web3(new Web3.providers.WebsocketProvider(`wss://ropsten.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`));

// Truffle abstraction to interact with our
// deployed contract
var oracleContract = contract(OracleContract);
oracleContract.setProvider(provider);

var oracleContractWss = contract(OracleContract);
oracleContractWss.setProvider(web3Wss.currentProvider);

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
  // console.log(err, accounts)
  oracleContract.at(oracleContractAddress)
  .then(async (oracleInstance) => {
    let btccap = await oracleInstance.getBTCCap({ from: accounts[0] })
    await oracleInstance.setBTCCap(100, { from: accounts[0] });
    console.log(btccap)
    oracleContractWss.at(oracleContractAddress).then(async (oracleInstanceWss) => {
      let allEventsFn = oracleInstanceWss.allEvents({ fromBlock: "latest" });
      allEventsFn.on("data", (data) => {
        console.log('got data', data);
        fetch.fetchUrl('https://cryptoviz.adityakarnam.me/coinsData', async (err, m, b) => {
          if (err) throw Error(err);
          const resultJSON = JSON.parse(b.toString())
          const btcMarketCap = parseInt(resultJSON.coinsData[Math.floor(Math.random() * 4)].volume);
          console.log(btcMarketCap)
          // Send data back contract on-chain
          try {
            await oracleInstance.setBTCCap(btcMarketCap, { from: accounts[0] });
          } catch(contractSetError) {
            console.error(contractSetError);
          }
          
        });
      });
    });
  })
  .catch((err) => {
    console.log(err)
  })
});
