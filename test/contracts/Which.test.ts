import { setupUser, setupUsers } from "./utils";
import chai from "chai";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
import { solidity } from "ethereum-waffle";
import { TAGS } from "../../utils/constants";

chai.use(solidity);

async function setup(tags: string[]) {
  await deployments.fixture(tags);
  const contracts = {
    Which: await ethers.getContract("Which"),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
  };
}

describe("Which", function () {
  const functions = ["a", "b", "c"];
  functions.forEach((fun) => {
    it(`should call ${fun}`, async function () {
      const { Which } = await setup([TAGS.WHICH]);
      await Which.functions[fun]();
    });
  });
});
