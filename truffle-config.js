const dotenv = require('dotenv');
const HDWalletProvider = require('@truffle/hdwallet-provider')

dotenv.config();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4710000
    },
    ropsten: {
      provider: () => 
        new HDWalletProvider(
          `${process.env.MNEMONIC}`,
          `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        ),
      timeoutBlocks: 50000,
      network_id: 3
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
  },
};
