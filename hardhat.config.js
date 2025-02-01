require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    sonicTestnet: {
      url: process.env.SONIC_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 57054,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      sonicTestnet: process.env.SONICSCAN_API_KEY,
    },
  },
};
