// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";
import { UintAndBool } from "../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.tags.mainnet) {
    return;
  }
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log(`Deployer: ${deployer}`);

  await deploy("UintAndBool", {
    from: deployer,
    log: true,
  });

  const UintAndBool = (await ethers.getContract("UintAndBool")) as UintAndBool;

  const init = await UintAndBool.estimateGas.init(100);
  console.log("init estimate", init.toString());
  let tx = await execute(
    "UintAndBool",
    {
      from: deployer,
      log: true,
    },
    "init",
    100
  );
  console.log(tx.gasUsed.toString());

  const setUint8 = await UintAndBool.estimateGas.setUint8(100);
  console.log("setUint8 estimate", setUint8.toString());
  tx = await execute(
    "UintAndBool",
    {
      from: deployer,
      log: true,
    },
    "setUint8",
    100
  );
  console.log(tx.gasUsed.toString());

  const setUint82 = await UintAndBool.estimateGas.setUint8(100);
  console.log("setUint8 estimate", setUint82.toString());
  tx = await execute(
    "UintAndBool",
    {
      from: deployer,
      log: true,
    },
    "setUint8",
    100
  );
  console.log(tx.gasUsed.toString());

  const setBool = await UintAndBool.estimateGas.setBool(true);
  console.log("setBool estimate", setBool.toString());
  tx = await execute(
    "UintAndBool",
    {
      from: deployer,
      log: true,
    },
    "setBool",
    true
  );
  console.log(tx.gasUsed.toString());

  const setBool2 = await UintAndBool.estimateGas.setBool(true);
  console.log("setBool estimate", setBool2.toString());
  tx = await execute(
    "UintAndBool",
    {
      from: deployer,
      log: true,
    },
    "setBool",
    true
  );
  console.log(tx.gasUsed.toString());
};

export default func;
func.tags = [TAGS.UINT_AND_BOOL];
