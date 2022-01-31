import { setupUser, setupUsers, uintToBytes2 } from "./utils";
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
    ERC721: await ethers.getContract("ERC721"),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
  };
}

describe("ERC721", function () {
  describe("IERC721", async function () {
    describe("balanceOf", async function () {
      const counts = [...Array(10).keys()];
      counts.forEach((count) => {
        it(`should return ${count}`, async function () {
          const { ERC721, users } = await setup([TAGS.ERC721]);
          if (count > 0) {
            await users[0].ERC721.safeMintBatch(
              "0x" + [...Array(count).keys()].map(uintToBytes2(false)).join("")
            );
          }
          const balance = await ERC721.balanceOf(users[0].address);
          expect(balance.toNumber()).to.equal(count);
        });
      });
    });
    describe("ownerOf", async function () {
      it("should revert when token does not exist", async () => {
        const { ERC721 } = await setup([TAGS.ERC721]);
        expect(ERC721.ownerOf(0)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      });
      it(`should return user0`, async function () {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        const owner = await ERC721.ownerOf(0);
        expect(owner).to.equal(users[0].address);
      });
    });
    describe("safeTransferFrom(address,address,uint256)", async function () {
      const tokenId = 0;
      it("should revert when from is address(0)", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        expect(
          ERC721.functions["safeTransferFrom(address,address,uint256)"](
            ethers.constants.AddressZero,
            users[0].address,
            tokenId
          )
        ).to.be.revertedWith("ERC721: from cannot be the zero address");
      });
      it("should revert when to is address(0)", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        expect(
          ERC721.functions["safeTransferFrom(address,address,uint256)"](
            users[0].address,
            ethers.constants.AddressZero,
            tokenId
          )
        ).to.be.revertedWith("ERC721: to cannot be the zero address");
      });
      it("should revert when sender is not approved", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(tokenId));
        expect(
          users[1].ERC721.functions[
            "safeTransferFrom(address,address,uint256)"
          ](users[0].address, users[1].address, tokenId)
        ).to.be.revertedWith("ERC721: caller is not approved for all tokens");
      });
      it("should transfer when sender is owner", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(tokenId));
        await users[0].ERC721.functions[
          "safeTransferFrom(address,address,uint256)"
        ](users[0].address, users[1].address, tokenId);
        const owner = await ERC721.ownerOf(tokenId);
        expect(owner).to.equal(users[1].address);
      });
      it("should transfer when sender is approved", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(tokenId));
        await users[0].ERC721.functions["approve(address,uint256)"](
          users[1].address,
          tokenId
        );
        await users[1].ERC721.functions[
          "safeTransferFrom(address,address,uint256)"
        ](users[0].address, users[1].address, tokenId);
        const owner = await ERC721.ownerOf(tokenId);
        expect(owner).to.equal(users[1].address);
      });
    });
    describe("approve(address,uint256", async function () {
      it("should revert when token does not exist", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[1].ERC721.functions["approve(address,uint256)"](
            users[0].address,
            0
          )
        ).to.be.revertedWith("ERC721: approve query for nonexistent token");
      });
      it("should revert when sender is neither owner nor approved", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        expect(
          users[1].ERC721.functions["approve(address,uint256)"](
            users[2].address,
            0
          )
        ).to.be.revertedWith(
          "ERC721: caller is not the owner nor an approved operator for the token"
        );
      });
      it("should approve user when sender is owner", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        await users[0].ERC721.functions["approve(address,uint256)"](
          users[1].address,
          0
        );
        const approved = await ERC721.getApproved(0);
        expect(approved).to.equal(users[1].address);
      });
      it("should approve user when sender is approved", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        await users[0].ERC721.functions["approve(address,uint256)"](
          users[1].address,
          0
        );
        await users[1].ERC721.functions["approve(address,uint256)"](
          users[2].address,
          0
        );
        const approved = await ERC721.getApproved(0);
        expect(approved).to.equal(users[2].address);
      });
    });
    describe("getApproved", async function () {
      it("should revert when token does not exist", async () => {
        const { ERC721 } = await setup([TAGS.ERC721]);
        expect(ERC721.functions["getApproved(uint256)"](0)).to.be.revertedWith(
          "ERC721: token does not exist"
        );
      });
      it("should return address(0) when no one has been approved", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        const approved = await ERC721.getApproved(0);
        expect(approved).to.equal(ethers.constants.AddressZero);
      });
      it("should return approved user address", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(0));
        await users[0].ERC721.functions["approve(address,uint256)"](
          users[2].address,
          0
        );
        const approved = await ERC721.getApproved(0);
        expect(approved).to.equal(users[2].address);
      });
    });
    describe("setApprovalForAll", async function () {
      it("should revert when operator is caller", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[0].ERC721.functions["setApprovalForAll(address,bool)"](
            users[0].address,
            true
          )
        ).to.be.revertedWith("ERC721: cannot approve caller as operator");
      });
      it("should approve all caller's tokens", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        const tokenIds = [3, 4, 10];
        await users[0].ERC721.safeMintBatch(
          "0x" + tokenIds.map(uintToBytes2(false)).join("")
        );
        await users[0].ERC721.functions["setApprovalForAll(address,bool)"](
          users[1].address,
          true
        );
        const approvedForAll = await ERC721.isApprovedForAll(
          users[0].address,
          users[1].address
        );
        expect(approvedForAll).to.be.true;
        await Promise.all(
          tokenIds.map(async (tokenId) => {
            const approved = await ERC721.getApproved(tokenId);
            expect(approved).to.equal(users[1].address);
          })
        );
      });
    });
  });
  describe("Bytes interfaces", async function () {
    describe("ownerIndex", async function () {
      it("should revert when owner does not exist", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        expect(ERC721.getOwnerIndex(users[0].address)).to.be.revertedWith(
          "ERC721: Owner not found"
        );
      });
      it("should return indexes for users minting in order", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch("0x0000");
        await users[1].ERC721.safeMintBatch("0x0002");
        const indexOfUser0 = await ERC721.getOwnerIndex(users[0].address);
        const indexOfUser1 = await ERC721.getOwnerIndex(users[1].address);
        expect(indexOfUser0).to.equal(0);
        expect(indexOfUser1).to.equal(1);
      });
      it("should update indexes after user emptied its token", async () => {
        const { ERC721, users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch("0x0000");
        await users[1].ERC721.safeMintBatch("0x0002");
        const indexOfUser0 = await ERC721.getOwnerIndex(users[0].address);
        await users[0].ERC721.functions[
          "safeTransferFrom(address,uint256,address,uint256)"
        ](users[0].address, indexOfUser0, users[2].address, 0);
        const indexOfUser1 = await ERC721.getOwnerIndex(users[1].address);
        const indexOfUser2 = await ERC721.getOwnerIndex(users[2].address);
        expect(indexOfUser1).to.equal(0);
        expect(indexOfUser2).to.equal(1);
        expect(ERC721.getOwnerIndex(users[0].address)).to.be.revertedWith(
          "ERC721: Owner not found"
        );
      });
    });
    describe("safeTransferFrom(address,uint256,address,uint256", async function () {
      it("should revert when from is address(0)", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        expect(
          ERC721.functions["safeTransferFrom(address,uint256,address,uint256)"](
            ethers.constants.AddressZero,
            0,
            users[1].address,
            0
          )
        ).to.be.revertedWith("ERC721: from cannot be the zero address");
      });
      it("should revert when to is address(0)", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        expect(
          ERC721.functions["safeTransferFrom(address,uint256,address,uint256)"](
            users[1].address,
            0,
            ethers.constants.AddressZero,
            0
          )
        ).to.be.revertedWith("ERC721: to cannot be the zero address");
      });
      it("should revert when token index is out of range", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        expect(
          ERC721.functions["safeTransferFrom(address,uint256,address,uint256)"](
            users[1].address,
            0,
            users[2].address,
            1
          )
        ).to.be.revertedWith("ERC721: token index out of range");
      });
      it("should revert when caller is neither approved nor owner", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(10));
        expect(
          users[1].ERC721.functions[
            "safeTransferFrom(address,uint256,address,uint256)"
          ](users[0].address, 0, users[2].address, 0)
        ).to.be.revertedWith("ERC721: caller is neither approved nor owner");
      });
      it("should transfer when sender is owner", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        const tokenId = 10;
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(tokenId));
        await users[0].ERC721.functions[
          "safeTransferFrom(address,uint256,address,uint256)"
        ](users[0].address, 0, users[1].address, 0);
        const owner = await ERC721.ownerOf(tokenId);
        expect(owner).to.equal(users[1].address);
      });
      it("should transfer when sender is approved", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        const tokenId = 10;
        await users[0].ERC721.safeMintBatch(uintToBytes2(true)(tokenId));
        await users[0].ERC721.functions["approve(address,uint256)"](
          users[1].address,
          tokenId
        );
        await users[1].ERC721.functions[
          "safeTransferFrom(address,uint256,address,uint256)"
        ](users[0].address, 0, users[2].address, 0);
        const owner = await ERC721.ownerOf(tokenId);
        expect(owner).to.equal(users[2].address);
      });
    });
    describe("safeMintBatch", async function () {
      it("should revert when tokenIds is empty", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[0].ERC721.functions["safeMintBatch(bytes)"]("0x")
        ).to.be.revertedWith("ERC721: cannot mint with no token Ids");
      });
      it("should revert when tokenIds is not even", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[0].ERC721.functions["safeMintBatch(bytes)"]("0x00")
        ).to.be.revertedWith("ERC721: tokenIds should be bytes of uint16");
      });
      it("should mint token id to sender", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.functions["safeMintBatch(bytes)"]("0x000a");
        const owner = await users[0].ERC721.ownerOf(10);
        expect(owner).to.equal(users[0].address);
      });
      it("should mint batch of token ids to sender", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.functions["safeMintBatch(bytes)"]("0x000a000c");
        const balance = await users[0].ERC721.balanceOf(users[0].address);
        expect(balance).to.equal(2);
        const existFirst = await ERC721.tokenExists(10);
        expect(existFirst).to.be.true;
        const existSecond = await ERC721.tokenExists(12);
        expect(existSecond).to.be.true;
        let owner = await users[0].ERC721.ownerOf(10);
        expect(owner).to.equal(users[0].address);
        owner = await users[0].ERC721.ownerOf(12);
        expect(owner).to.equal(users[0].address);
      });
      it("should revert when token already exists in same batch", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[0].ERC721.functions["safeMintBatch(bytes)"]("0x000a000a")
        ).to.be.revertedWith("ERC721: token already exists");
      });
      it("should revert when token already exists from previous mint", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.functions["safeMintBatch(bytes)"]("0x000a");
        expect(
          users[0].ERC721.functions["safeMintBatch(bytes)"]("0x000a")
        ).to.be.revertedWith("ERC721: token already exists");
      });
    });
    describe("approve(address,uint256,uint256", async function () {
      it("should revert when token does not exist", async () => {
        const { users } = await setup([TAGS.ERC721]);
        expect(
          users[1].ERC721.functions["approve(address,uint256,uint256)"](
            users[0].address,
            0,
            0
          )
        ).to.be.revertedWith("ERC721: token index out of range");
      });
      it("should revert when caller is neither approved nor owner", async () => {
        const { users } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch("0x0000");
        await users[1].ERC721.safeMintBatch("0x0001");
        expect(
          users[1].ERC721.functions["approve(address,uint256,uint256)"](
            users[2].address,
            0,
            0
          )
        ).to.be.revertedWith("ERC721: caller is neither approved nor owner");
      });
      it("should approve when caller is owner", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch("0x000a");
        await users[0].ERC721.functions["approve(address,uint256,uint256)"](
          users[1].address,
          10,
          0
        );
        const approved = await ERC721.getApproved(10);
        expect(approved).to.equal(users[1].address);
      });
      it("should approve when caller is approved", async () => {
        const { users, ERC721 } = await setup([TAGS.ERC721]);
        await users[0].ERC721.safeMintBatch("0x000a");
        await users[0].ERC721.functions["approve(address,uint256,uint256)"](
          users[1].address,
          10,
          0
        );
        await users[1].ERC721.functions["approve(address,uint256,uint256)"](
          users[2].address,
          10,
          0
        );
        const approved = await ERC721.getApproved(10);
        expect(approved).to.equal(users[2].address);
      });
    });
  });
});
