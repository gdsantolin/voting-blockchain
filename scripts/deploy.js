const hre = require("hardhat");

async function main() {

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", await deployer.getAddress());
  
    const Token = await hre.ethers.getContractFactory("Turing");
    const token = await Token.deploy();
    await token.deployed();
  
    console.log("Token address:", token.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
