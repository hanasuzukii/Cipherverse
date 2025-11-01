import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFleet = await deploy("CipherverseFleet", {
    from: deployer,
    log: true,
  });

  console.log(`CipherverseFleet contract: `, deployedFleet.address);
};
export default func;
func.id = "deploy_cipherverseFleet"; // id required to prevent reexecution
func.tags = ["CipherverseFleet"];
