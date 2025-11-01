import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * CipherverseFleet Task Cheatsheet
 * =================================
 *
 * Localhost workflow:
 *   1. npx hardhat node
 *   2. npx hardhat --network localhost deploy
 *   3. npx hardhat --network localhost task:mint-ship
 *   4. npx hardhat --network localhost task:decrypt-attack
 *   5. npx hardhat --network localhost task:launch-attack --defense 90
 *
 * Sepolia workflow:
 *   1. npx hardhat --network sepolia deploy
 *   2. npx hardhat --network sepolia task:mint-ship
 *   3. npx hardhat --network sepolia task:decrypt-attack
 *   4. npx hardhat --network sepolia task:launch-attack --defense 120
 */

task("task:address", "Prints the CipherverseFleet address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fleet = await deployments.get("CipherverseFleet");

  console.log("CipherverseFleet address is " + fleet.address);
});

task("task:decrypt-attack", "Decrypts the caller's spaceship attack power")
  .addOptionalParam("address", "Optionally specify the CipherverseFleet contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherverseFleet");
    console.log(`CipherverseFleet: ${deployment.address}`);

    const [pilot] = await ethers.getSigners();
    const fleet = await ethers.getContractAt("CipherverseFleet", deployment.address);

    const tokenId = await fleet.shipOf(pilot.address);
    if (tokenId === 0n) {
      console.log("No spaceship minted for this address.");
      return;
    }

    const encryptedPower = await fleet.getAttackPower(tokenId);
    const clearPower = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPower,
      deployment.address,
      pilot,
    );

    console.log(`Spaceship tokenId : ${tokenId}`);
    console.log(`Encrypted power   : ${encryptedPower}`);
    console.log(`Clear attack power: ${clearPower}`);
  });

task("task:mint-ship", "Mints a spaceship NFT for the caller")
  .addOptionalParam("address", "Optionally specify the CipherverseFleet contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherverseFleet");
    console.log(`CipherverseFleet: ${deployment.address}`);

    const [pilot] = await ethers.getSigners();
    const fleet = await ethers.getContractAt("CipherverseFleet", deployment.address);

    const existing = await fleet.shipOf(pilot.address);
    if (existing !== 0n) {
      console.log(`Pilot already owns spaceship tokenId ${existing}.`);
      return;
    }

    const tx = await fleet.connect(pilot).mintShip();
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const tokenId = await fleet.shipOf(pilot.address);
    console.log(`Minted spaceship tokenId ${tokenId} for pilot ${pilot.address}`);
  });

task("task:launch-attack", "Launches an attack against an encrypted defense value")
  .addOptionalParam("address", "Optionally specify the CipherverseFleet contract address")
  .addParam("defense", "The defense value to encrypt")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.defense);
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Argument --defense must be a non-negative integer`);
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherverseFleet");
    console.log(`CipherverseFleet: ${deployment.address}`);

    const [pilot] = await ethers.getSigners();
    const fleet = await ethers.getContractAt("CipherverseFleet", deployment.address);

    const tokenId = await fleet.shipOf(pilot.address);
    if (tokenId === 0n) {
      throw new Error("Pilot has no spaceship. Run task:mint-ship first.");
    }

    const encryptedDefense = await fhevm
      .createEncryptedInput(deployment.address, pilot.address)
      .add32(value)
      .encrypt();

    const tx = await fleet
      .connect(pilot)
      .launchAttack(tokenId, encryptedDefense.handles[0], encryptedDefense.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const encryptedResult = await fleet.getLastAttackResult(tokenId);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      deployment.address,
      pilot,
    );

    console.log(`Encrypted result: ${encryptedResult}`);
    console.log(`Attack success  : ${clearResult}`);
  });
