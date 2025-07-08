const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying JusticeFundSettlement contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const JusticeFundSettlement = await ethers.getContractFactory("JusticeFundSettlement");
  const justiceFundSettlement = await JusticeFundSettlement.deploy();

  await justiceFundSettlement.deployed();

  console.log("JusticeFundSettlement deployed to:", justiceFundSettlement.address);
  
  // Verify deployment
  const totalSettlements = await justiceFundSettlement.getTotalSettlements();
  console.log("Total settlements:", totalSettlements.toString());
  
  const contractBalance = await justiceFundSettlement.getContractBalance();
  console.log("Contract balance:", ethers.utils.formatEther(contractBalance), "ETH");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: justiceFundSettlement.address,
    deployer: deployer.address,
    network: network.name,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });