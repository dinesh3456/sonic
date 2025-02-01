module.exports = {
  // Ethereum (Sepolia) Contracts
  ETH_CONTRACTS: {
    TOKEN_DEPOSIT: "0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20",
    TOKEN_PAIRS: "0xf2b1510c2709072C88C5b14db90Ec3b6297193e4",
    STATE_ORACLE: "0xB7e8CC3F5FeA12443136f0cc13D81F109B2dEd7f",
  },

  // Sonic Testnet Contracts
  SONIC_CONTRACTS: {
    BRIDGE: "0x9EF7629F9B930168b76283AdD7120777b3c895b3",
    TOKEN_PAIRS: "0x134E4c207aD5A13549DE1eBF8D43c1f49b00ba94",
    STATE_ORACLE: "0x836664B0c0CB29B7877bCcF94159CC996528F2C3",
  },

  // Network RPC endpoints
  ETHEREUM_RPC:
    process.env.ETHEREUM_RPC ||
    "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
  SONIC_RPC: process.env.SONIC_RPC || "https://rpc.blaze.soniclabs.com",
};
