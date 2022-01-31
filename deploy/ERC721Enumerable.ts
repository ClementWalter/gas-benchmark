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

  await deploy("ERC721Enumerable", {
    from: deployer,
    log: true,
    args: ["Dreamers", "DRE"],
    contract: "contracts/tokens/ERC721Enumerable.sol:ERC721Enumerable",
  });
};

export default func;
func.tags = [TAGS.ERC721Enumerable];
