require("dotenv").config();
const { ethers } = require("ethers");

async function testConnections() {
  console.log("Testing connections...");

  // Test Ethereum connection
  console.log("\nTesting Ethereum (Sepolia) connection:");
  console.log("RPC URL:", process.env.ETHEREUM_RPC);
  try {
    const ethProvider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC
    );
    const ethNetwork = await ethProvider.getNetwork();
    console.log("✓ Successfully connected to Ethereum network");
    console.log("Network details:", {
      name: ethNetwork.name,
      chainId: ethNetwork.chainId,
    });
  } catch (error) {
    console.error("✗ Failed to connect to Ethereum network");
    console.error("Error:", error.message);
  }

  // Test Sonic connection
  console.log("\nTesting Sonic connection:");
  console.log("RPC URL:", process.env.SONIC_RPC);
  try {
    const sonicProvider = new ethers.providers.JsonRpcProvider(
      process.env.SONIC_RPC
    );
    const sonicNetwork = await sonicProvider.getNetwork();
    console.log("✓ Successfully connected to Sonic network");
    console.log("Network details:", {
      name: sonicNetwork.name,
      chainId: sonicNetwork.chainId,
    });
  } catch (error) {
    console.error("✗ Failed to connect to Sonic network");
    console.error("Error:", error.message);
  }
}

testConnections()
  .then(() => {
    console.log("\nConnection test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed with error:", error);
    process.exit(1);
  });
