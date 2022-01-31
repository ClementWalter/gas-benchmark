// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!hre.network.tags.local) {
    return;
  }
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("CheckAndWriteBatchIndexesAndAddresses", {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = [TAGS.CHECK_AND_WRITE_BATCH_INDEXES_AND_ADDRESSES];
