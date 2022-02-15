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

  await deploy("ERC721OZ", {
    from: deployer,
    log: true,
    args: ["Dreamers", "DRE"],
    contract: "contracts/tokens/ERC721OZ.sol:ERC721OZ",
  });
  await deploy("ERC721OZ16", {
    from: deployer,
    log: true,
    args: ["Dreamers", "DRE"],
    contract: "contracts/tokens/ERC721OZ16.sol:ERC721OZ16",
  });
  await deploy("ERC721OZEnumerable", {
    from: deployer,
    log: true,
    args: ["Dreamers", "DRE"],
    contract: "contracts/tokens/ERC721OZEnumerable.sol:ERC721OZEnumerable",
  });
  await deploy("ERC721OZ16Enumerable", {
    from: deployer,
    log: true,
    args: ["Dreamers", "DRE"],
    contract: "contracts/tokens/ERC721OZ16Enumerable.sol:ERC721OZ16Enumerable",
  });
};

export default func;
func.tags = [TAGS.ERC721OZ];
