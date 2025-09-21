// scripts/deploy.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  // --- Deploy BlueCarbonCredit (ERC20) ---
  const BlueCarbonCredit = await ethers.getContractFactory("BlueCarbonCredit");
  const credit = await BlueCarbonCredit.deploy();
  await credit.waitForDeployment();
  const creditAddress = await credit.getAddress();
  console.log("BlueCarbonCredit deployed at:", creditAddress);

  // --- Deploy PlantationRegistry (ERC721) ---
  const PlantationRegistry = await ethers.getContractFactory("PlantationRegistry");
  const registry = await PlantationRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("PlantationRegistry deployed at:", registryAddress);

  // --- Grant roles ---
  const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
  const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();

  const verifierAddress = process.env.VERIFIER_ADDRESS;
  console.log("Verifier address from .env:", verifierAddress);

  // Grant verifier role
  let tx = await registry.grantRole(VERIFIER_ROLE, verifierAddress);
  await tx.wait();
  console.log(`Granted VERIFIER_ROLE to: ${verifierAddress}`);

  // (Optional) Grant admin role
  tx = await registry.grantRole(DEFAULT_ADMIN_ROLE, verifierAddress);
  await tx.wait();
  console.log(`Granted ADMIN_ROLE to: ${verifierAddress}`);

  console.log("✅ Deployment + Role setup complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
