// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!hre.network.tags.local) {
    return;
  }
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("Which", {
    from: deployer,
    log: true,
  });

  const Which = await ethers.getContract("Which");
  const a = await Which.estimateGas.a();
  console.log("a", a.toString());
  const b = await Which.estimateGas.b();
  console.log("b", b.toString());
  const c = await Which.estimateGas.c();
  console.log("c", c.toString());
};

export default func;
func.tags = [TAGS.WHICH];
