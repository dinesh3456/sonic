const { ethers } = require("ethers");
require("dotenv").config();

// Simplified contract setup focusing on essential bridge contracts
const CONTRACTS = {
  SEPOLIA: {
    TOKEN_DEPOSIT: "0x9Ef7629F9B930168b76283AdD7120777b3c895b3", // TokenDeposit contract on Sepolia
  },
  SONIC: {
    WRAPPED_S: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // Wrapped S token on Sonic
  },
};

// Simplified ABI focusing only on deposit functionality
const TOKEN_DEPOSIT_ABI = [
  "function deposit() external payable",
  "event Deposit(address indexed sender, uint256 amount)",
];

async function initializeProviders() {
  console.log("Initializing providers...");
  const ethProvider = new ethers.providers.JsonRpcProvider(
    process.env.ETHEREUM_RPC
  );
  const sonicProvider = new ethers.providers.JsonRpcProvider(
    process.env.SONIC_RPC
  );

  const ethSigner = new ethers.Wallet(process.env.PRIVATE_KEY, ethProvider);
  const sonicSigner = new ethers.Wallet(process.env.PRIVATE_KEY, sonicProvider);

  console.log("Providers initialized successfully");
  return { ethProvider, sonicProvider, ethSigner, sonicSigner };
}

async function checkBalances() {
  const { ethSigner, sonicSigner } = await initializeProviders();

  const ethBalance = await ethSigner.getBalance();
  const sonicBalance = await sonicSigner.getBalance();

  console.log("\nCurrent Balances:");
  console.log(`Sepolia ETH: ${ethers.utils.formatEther(ethBalance)} ETH`);
  console.log(
    `Sonic Balance: ${ethers.utils.formatEther(sonicBalance)} native`
  );

  return { ethBalance, sonicBalance };
}

async function bridgeToSonic(amount) {
  const { ethSigner } = await initializeProviders();

  console.log(
    `\nInitiating bridge transfer of ${ethers.utils.formatEther(
      amount
    )} ETH to Sonic...`
  );

  try {
    // Create contract instance
    const depositContract = new ethers.Contract(
      CONTRACTS.SEPOLIA.TOKEN_DEPOSIT,
      TOKEN_DEPOSIT_ABI,
      ethSigner
    );

    // Set explicit gas parameters
    const gasPrice = await ethSigner.provider.getGasPrice();
    const gasLimit = 300000; // Set high enough gas limit

    console.log("\nSending deposit transaction...");
    const tx = await depositContract.deposit({
      value: amount,
      gasLimit: gasLimit,
      gasPrice: gasPrice.mul(12).div(10), // 20% higher for priority
    });

    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("\nTransaction successful!");
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

      // Check for deposit event
      const depositEvent = receipt.events?.find((e) => e.event === "Deposit");
      if (depositEvent) {
        console.log(`\nDeposit event found:`);
        console.log(
          `Amount: ${ethers.utils.formatEther(depositEvent.args.amount)} ETH`
        );
      }
    } else {
      console.log("\nTransaction failed!");
    }

    return receipt;
  } catch (error) {
    console.error("\nError during bridge operation:");
    if (error.transaction) {
      console.log("Transaction details:", {
        to: error.transaction.to,
        value: error.transaction.value
          ? ethers.utils.formatEther(error.transaction.value)
          : "0",
        data: error.transaction.data,
      });
    }
    if (error.receipt) {
      console.log("Receipt details:", {
        status: error.receipt.status,
        gasUsed: error.receipt.gasUsed?.toString(),
      });
    }
    throw error;
  }
}

async function main() {
  try {
    // Check initial balances
    console.log("Checking initial balances...");
    await checkBalances();

    // Bridge small amount (0.001 ETH)
    const amount = ethers.utils.parseEther("0.001");
    console.log(
      `\nAttempting to bridge ${ethers.utils.formatEther(amount)} ETH...`
    );
    await bridgeToSonic(amount);

    // Check final balances
    console.log("\nChecking final balances...");
    await checkBalances();
  } catch (error) {
    console.error("\nMain process failed:", error.message);
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
  checkBalances,
  initializeProviders,
};
