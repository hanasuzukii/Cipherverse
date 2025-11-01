import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { CipherverseFleet, CipherverseFleet__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CipherverseFleet")) as CipherverseFleet__factory;
  const fleetContract = (await factory.deploy()) as CipherverseFleet;
  const fleetAddress = await fleetContract.getAddress();

  return { fleetContract, fleetAddress };
}

describe("CipherverseFleet", function () {
  let signers: Signers;
  let fleetContract: CipherverseFleet;
  let fleetAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fleetContract, fleetAddress } = await deployFixture());
  });

  it("mints an encrypted spaceship with attack power 100", async function () {
    const tx = await fleetContract.connect(signers.alice).mintShip();
    await tx.wait();

    const tokenId = await fleetContract.shipOf(signers.alice.address);
    expect(tokenId).to.not.eq(0n);

    const encryptedPower = await fleetContract.getAttackPower(tokenId);
    const clearPower = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPower,
      fleetAddress,
      signers.alice,
    );

    expect(clearPower).to.eq(100);
  });

  it("prevents pilots from minting more than one ship", async function () {
    await fleetContract.connect(signers.alice).mintShip();

    await expect(fleetContract.connect(signers.alice).mintShip()).to.be.revertedWithCustomError(
      fleetContract,
      "AlreadyMinted",
    );
  });

  it("records attack outcomes as encrypted booleans", async function () {
    await fleetContract.connect(signers.alice).mintShip();
    const tokenId = await fleetContract.shipOf(signers.alice.address);

    const lowDefense = await fhevm
      .createEncryptedInput(fleetAddress, signers.alice.address)
      .add32(60)
      .encrypt();

    let tx = await fleetContract
      .connect(signers.alice)
      .launchAttack(tokenId, lowDefense.handles[0], lowDefense.inputProof);
    await tx.wait();

    let encryptedResult = await fleetContract.getLastAttackResult(tokenId);
    let clearResult = await fhevm.userDecryptEbool(encryptedResult, fleetAddress, signers.alice);
    expect(clearResult).to.be.true;

    const highDefense = await fhevm
      .createEncryptedInput(fleetAddress, signers.alice.address)
      .add32(160)
      .encrypt();

    tx = await fleetContract
      .connect(signers.alice)
      .launchAttack(tokenId, highDefense.handles[0], highDefense.inputProof);
    await tx.wait();

    encryptedResult = await fleetContract.getLastAttackResult(tokenId);
    clearResult = await fhevm.userDecryptEbool(encryptedResult, fleetAddress, signers.alice);
    expect(clearResult).to.be.false;
  });
});
