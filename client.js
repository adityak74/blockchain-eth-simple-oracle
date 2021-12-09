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

// Truffle abstraction to interact with our
// deployed contract
var oracleContract = contract(OracleContract);
oracleContract.setProvider(provider);

web3.eth.getAccounts((err, accounts) => {
  oracleContract.at(oracleContractAddress)
    .then((oracleInstance) => {
      // Our promises
      const oraclePromises = [
        oracleInstance.getBTCCap(),  // Get currently stored BTC Cap
        oracleInstance.updateBTCCap({from: accounts[0]})  // Request oracle to update the information
      ]

      // Map over all promises
      Promise.all(oraclePromises)
      .then((result) => {
        console.log('BTC Market Cap: ' + result[0])
        console.log('Requesting Oracle to update CMC Information...')
        process.exit();
      })
      .catch((err) => {
        console.log(err)
      })
    })
    .catch((err) => {
      console.log(err)
    });
});
