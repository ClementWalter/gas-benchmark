// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.tags.mainnet) {
    return;
  }
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log(`Deployer: ${deployer}`);

  await deploy("Which", {
    from: deployer,
    log: true,
  });

  const Which = await ethers.getContract("Which");
  const a = await Which.estimateGas.a();
  console.log("a estimate", a.toString());
  await execute(
    "Which",
    {
      from: deployer,
      log: true,
    },
    "a"
  );
  const b = await Which.estimateGas.b();
  console.log("b estimate", b.toString());
  await execute(
    "Which",
    {
      from: deployer,
      log: true,
    },
    "b"
  );
  const c = await Which.estimateGas.c();
  console.log("c estimate", c.toString());
  await execute(
    "Which",
    {
      from: deployer,
      log: true,
    },
    "c"
  );
};

export default func;
func.tags = [TAGS.WHICH];
