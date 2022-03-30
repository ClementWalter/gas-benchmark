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
    UintAndBool: await ethers.getContract("UintAndBool"),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
  };
}

describe("UintAndBool", function () {
  const functions = [
    { key: "setUint8", value: 200 },
    { key: "setBool", value: true },
  ];
  functions.forEach((fun) => {
    it(`${fun.key}`, async function () {
      const { UintAndBool } = await setup([TAGS.UINT_AND_BOOL]);
      await UintAndBool.functions[fun.key](fun.value);
    });
  });
});
