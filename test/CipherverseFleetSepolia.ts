import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { CipherverseFleet } from "../types";
import { expect } from "chai";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("CipherverseFleetSepolia", function () {
  let signers: Signers;
  let fleetContract: CipherverseFleet;
  let fleetAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("CipherverseFleet");
      fleetAddress = deployment.address;
      fleetContract = await ethers.getContractAt("CipherverseFleet", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("decrypts attack outcomes on Sepolia", async function () {
    steps = 10;
    this.timeout(4 * 40000);

    progress("Check existing spaceship...");
    let tokenId = await fleetContract.shipOf(signers.alice.address);
    if (tokenId === 0n) {
      progress("Minting spaceship for signer...");
      const mintTx = await fleetContract.connect(signers.alice).mintShip();
      await mintTx.wait();
      tokenId = await fleetContract.shipOf(signers.alice.address);
    }

    expect(tokenId).to.not.eq(0n);

    progress("Encrypting defense value 80...");
    const encryptedDefense = await fhevm
      .createEncryptedInput(fleetAddress, signers.alice.address)
      .add32(80)
      .encrypt();

    progress("Launching attack...");
    const tx = await fleetContract
      .connect(signers.alice)
      .launchAttack(tokenId, encryptedDefense.handles[0], encryptedDefense.inputProof);
    await tx.wait();

    progress("Fetching encrypted result...");
    const encryptedResult = await fleetContract.getLastAttackResult(tokenId);

    progress("Decrypting result...");
    const clear = await fhevm.userDecryptEbool(encryptedResult, fleetAddress, signers.alice);
    progress(`Attack success=${clear}`);

    expect(typeof clear).to.eq("boolean");
  });
});
