import { task } from "hardhat/config";
import fs from "fs";
import { SingleBar } from "cli-progress";

task(
  "mint-batch",
  "Estimate gas required for batch minting with different ERC721Enumerable implementations"
).setAction(async ({}, { ethers, getUnnamedAccounts }) => {
  const { utils } = ethers;
  const { hexlify, hexConcat, hexZeroPad } = utils;
  const ERC721BEnumerable = await ethers.getContract("ERC721BEnumerable");
  const ERC721A = await ethers.getContract("ERC721A");
  const ERC721OZ = await ethers.getContract("ERC721OZ");
  const ERC721OZ16 = await ethers.getContract("ERC721OZ16");
  const ERC721OZEnumerable = await ethers.getContract("ERC721OZEnumerable");
  const ERC721OZ16Enumerable = await ethers.getContract("ERC721OZ16Enumerable");
  const ERC721Naomsa = await ethers.getContract("ERC721Naomsa");
  const users = await getUnnamedAccounts();
  const bar = new SingleBar({});

  // Make benchmark for minting a batch when contract is empty, batch length from 1 to indexesLength
  const indexesLength = 128;
  bar.start(indexesLength, 0);
  const gas = await Promise.all(
    [...Array(indexesLength).keys()].map(async (i) => {
      const indexes = [...Array(i + 1).keys()];
      const bytes2Indexes = hexConcat(
        indexes.map((index) => hexZeroPad(hexlify([index]), 2))
      );

      const erc721BEnumerableGas =
        await ERC721BEnumerable.estimateGas.safeMintBatch(bytes2Indexes);
      const erc721AGas = await ERC721A.estimateGas.safeMintBatch(
        users[0],
        i + 1
      );
      const erc721OZGas = await ERC721OZ.estimateGas.safeMintBatch(
        users[0],
        indexes
      );
      const erc721OZ16Gas = await ERC721OZ16.estimateGas.safeMintBatch(
        users[0],
        indexes
      );
      const erc721OZGasEnumerable =
        await ERC721OZEnumerable.estimateGas.safeMintBatch(users[0], indexes);
      const erc721OZ16EnumerableGas =
        await ERC721OZ16Enumerable.estimateGas.safeMintBatch(users[0], indexes);
      const erc721NaomsaGas = await ERC721Naomsa.estimateGas.safeMintBatch(
        users[0],
        indexes
      );
      bar.increment();
      return {
        ERC721BEnumerable: erc721BEnumerableGas.toNumber(),
        ERC721A: erc721AGas.toNumber(),
        ERC721OZ: erc721OZGas.toNumber(),
        ERC721OZ16: erc721OZ16Gas.toNumber(),
        ERC721OZEnumerable: erc721OZGasEnumerable.toNumber(),
        ERC721OZ16Enumerable: erc721OZ16EnumerableGas.toNumber(),
        ERC721Naomsa: erc721NaomsaGas.toNumber(),
      };
    })
  );
  bar.stop();

  fs.writeFileSync("./data/mintBatch.json", JSON.stringify(gas, null, 2));
});
