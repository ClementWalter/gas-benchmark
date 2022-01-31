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
const { expect } = chai;

async function setup(tags: string[]) {
  await deployments.fixture(tags);
  const contracts = {
    ERC721Enumerable: await ethers.getContract("ERC721Enumerable"),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
  };
}

describe("ERC721Enumerable", function () {
  describe("totalSupply", async function () {
    it("should return 0 when no token has been minted", async () => {
      const { ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(0);
    });
    it("should return correct value with one single owner", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x000a00000001");
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(3);
    });
    it("should return correct value with one single owner minting twice", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch(
        "0x" + "000a" + "0000" + "0001"
      );
      await users[0].ERC721Enumerable.safeMintBatch("0x0002");
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(4);
    });
    it("should return correct value with two minters", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch(
        "0x" + "000a" + "0000" + "0001"
      );
      await users[1].ERC721Enumerable.safeMintBatch("0x0002");
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(4);
    });
    it("should return correct value after transfer to single owner", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch(
        "0x" + "000a" + "0000" + "0001"
      );
      await users[1].ERC721Enumerable.safeMintBatch("0x0002");
      await users[1].ERC721Enumerable.functions[
        "safeTransferFrom(address,uint256,address,uint256)"
      ](users[1].address, 1, users[0].address, 0);
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(4);
    });
    it("should return correct value after transfer to new owner", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch(
        "0x" + "000a" + "0000" + "0001"
      );
      await users[1].ERC721Enumerable.safeMintBatch("0x0002");
      await users[1].ERC721Enumerable.functions[
        "safeTransferFrom(address,uint256,address,uint256)"
      ](users[1].address, 1, users[2].address, 0);
      const totalSupply = await ERC721Enumerable.totalSupply();
      expect(totalSupply.toNumber()).to.equal(4);
    });
  });
  describe("tokenOfOwnerByIndex", async function () {
    it("should revert when user has no token", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      expect(
        ERC721Enumerable.tokenOfOwnerByIndex(users[0].address, 0)
      ).to.be.revertedWith("ERC721Enumerable: index out of range");
    });
    it("should revert when token is out of range", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x0000");
      expect(
        ERC721Enumerable.tokenOfOwnerByIndex(users[0].address, 1)
      ).to.be.revertedWith("ERC721Enumerable: index out of range");
    });
    it("should enumerate all tokens", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x000a00ff");
      const firstToken = await ERC721Enumerable.tokenOfOwnerByIndex(
        users[0].address,
        0
      );
      const secondToken = await ERC721Enumerable.tokenOfOwnerByIndex(
        users[0].address,
        1
      );
      expect(firstToken.toNumber()).to.equal(10);
      expect(secondToken.toNumber()).to.equal(255);
      const balance = await ERC721Enumerable.balanceOf(users[0].address);
      expect(balance.toNumber()).to.equal(2);
    });
    it("should enumerate all tokens after transfer", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x000a00ff");
      await users[0].ERC721Enumerable.functions[
        "safeTransferFrom(address,uint256,address,uint256)"
      ](users[0].address, 0, users[1].address, 0);
      const firstToken = await ERC721Enumerable.tokenOfOwnerByIndex(
        users[0].address,
        0
      );
      expect(firstToken.toNumber()).to.equal(255);
      expect(
        ERC721Enumerable.tokenOfOwnerByIndex(users[0].address, 1)
      ).to.be.revertedWith("ERC721Enumerable: index out of range");
      const secondToken = await ERC721Enumerable.tokenOfOwnerByIndex(
        users[1].address,
        0
      );
      expect(secondToken.toNumber()).to.equal(10);
    });
  });
  describe("tokenByIndex", async function () {
    it("should revert when index is out of bound", async () => {
      const { ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      expect(ERC721Enumerable.tokenByIndex(0)).to.be.revertedWith(
        "ERC721: ownerIndex out of bound"
      );
    });
    it("should return token of first user", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x000a00ff");
      let token = await ERC721Enumerable.tokenByIndex(0);
      expect(token.toNumber()).to.equal(10);
      token = await ERC721Enumerable.tokenByIndex(1);
      expect(token.toNumber()).to.equal(255);
      expect(ERC721Enumerable.tokenByIndex(2)).to.be.revertedWith(
        "ERC721: ownerIndex out of bound"
      );
    });
    it("should return token of second user", async () => {
      const { users, ERC721Enumerable } = await setup([TAGS.ERC721Enumerable]);
      await users[0].ERC721Enumerable.safeMintBatch("0x000a00ff");
      await users[1].ERC721Enumerable.safeMintBatch("0x000b0fff");
      let token = await ERC721Enumerable.tokenByIndex(2);
      expect(token.toNumber()).to.equal(11);
      token = await ERC721Enumerable.tokenByIndex(3);
      expect(token.toNumber()).to.equal(4095);
      expect(ERC721Enumerable.tokenByIndex(4)).to.be.revertedWith(
        "ERC721: ownerIndex out of bound"
      );
    });
  });
});
