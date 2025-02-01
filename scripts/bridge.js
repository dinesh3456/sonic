const { ethers } = require("ethers");
require("dotenv").config();

// Load environment variables
const ETHEREUM_RPC = process.env.ETHEREUM_RPC;
const SONIC_RPC = process.env.SONIC_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Use checksummed addresses
const CONTRACTS = {
  BRIDGE: ethers.utils.getAddress("0x9Ef7629F9B930168b76283AdD7120777b3c895b3"), // Ensure checksum format
  WRAPPED_ETH: ethers.utils.getAddress(
    "0x309C92261178fA0CF748A855e90Ae73FDb79EBc7"
  ),
  TOKEN_PAIRS: ethers.utils.getAddress(
    "0x134E4c207aD5A13549DE1eBF8D43c1f49b00ba94"
  ),
  STATE_ORACLE: ethers.utils.getAddress(
    "0x836664B0c0CB29B7877bCcF94159CC996528F2C3"
  ),
};

// ABI for bridge interaction
const BRIDGE_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "event Deposit(address indexed sender, uint256 amount)",
  "event Withdrawal(address indexed recipient, uint256 amount)",
];

// Initialize providers and signers
let ethProvider, sonicProvider, ethSigner, sonicSigner;

async function initializeProviders() {
  console.log("Initializing providers...");

  ethProvider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
  await ethProvider.ready;

  sonicProvider = new ethers.providers.JsonRpcProvider(SONIC_RPC);
  await sonicProvider.ready;

  ethSigner = new ethers.Wallet(PRIVATE_KEY, ethProvider);
  sonicSigner = new ethers.Wallet(PRIVATE_KEY, sonicProvider);

  console.log("Providers initialized successfully");
}

async function checkBalance() {
  const ethBalance = await ethSigner.getBalance();
  const sonicBalance = await sonicSigner.getBalance();

  console.log(`\nBalance Check:`);
  console.log(`Wallet Address: ${ethSigner.address}`);
  console.log(
    `Sepolia ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`
  );
  console.log(`Sonic Balance: ${ethers.utils.formatEther(sonicBalance)} ETH`);

  return { ethBalance, sonicBalance };
}

async function bridgeToSonic(amount) {
  try {
    console.log("\nChecking balances before bridge...");
    const { ethBalance } = await checkBalance();

    // Ensure enough ETH for transfer plus gas
    const estimatedGas = ethers.utils.parseEther("0.01");
    const totalNeeded = amount.add(estimatedGas);

    if (ethBalance.lt(totalNeeded)) {
      throw new Error(
        `Insufficient ETH balance. Have ${ethers.utils.formatEther(
          ethBalance
        )}, need ${ethers.utils.formatEther(totalNeeded)} (including gas)`
      );
    }

    console.log(
      `\nInitiating bridge transfer of ${ethers.utils.formatEther(
        amount
      )} ETH...`
    );

    // Create contract instance
    const bridge = new ethers.Contract(CONTRACTS.BRIDGE, BRIDGE_ABI, ethSigner);

    // Send transaction
    const tx = await bridge.deposit({ value: amount });
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log(`\nBridge transfer successful!`);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`Block number: ${receipt.blockNumber}`);

    // Look for Deposit event
    const depositEvent = receipt.events?.find((e) => e.event === "Deposit");
    if (depositEvent) {
      console.log(
        `Deposit event found - Amount: ${ethers.utils.formatEther(
          depositEvent.args.amount
        )} ETH`
      );
    }

    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      amount: amount,
    };
  } catch (error) {
    console.error("\nBridge to Sonic failed:", error.message);
    throw error;
  }
}

async function testConnections() {
  console.log("\nTesting network connections...");

  try {
    const ethNetwork = await ethProvider.getNetwork();
    console.log("Successfully connected to Ethereum network:", {
      name: ethNetwork.name,
      chainId: ethNetwork.chainId,
    });
  } catch (error) {
    console.error("Failed to connect to Ethereum network:", error.message);
    throw error;
  }

  try {
    const sonicNetwork = await sonicProvider.getNetwork();
    console.log("Successfully connected to Sonic network:", {
      name: sonicNetwork.name,
      chainId: sonicNetwork.chainId,
    });
  } catch (error) {
    console.error("Failed to connect to Sonic network:", error.message);
    throw error;
  }
}

async function main() {
  try {
    await initializeProviders();
    await testConnections();

    // Bridge 0.01 ETH for testing
    const amount = ethers.utils.parseEther("0.001");
    await checkBalance();

    console.log("\nStarting bridge process...");
    const result = await bridgeToSonic(amount);
    console.log("\nBridge process completed!");
    console.log(result);

    console.log("\nFinal balances:");
    await checkBalance();
  } catch (error) {
    console.error("\nMain process failed:", error.message);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = {
  bridgeToSonic,
  initializeProviders,
  testConnections,
  checkBalance,
};
