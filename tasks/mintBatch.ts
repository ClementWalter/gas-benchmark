import { task } from "hardhat/config";
import fs from "fs";
import { SingleBar } from "cli-progress";

task(
  "mint-batch",
  "Estimate gas required for batch minting with different ERC721Enumerable implementations"
).setAction(async ({}, { ethers, getUnnamedAccounts }) => {
  const { utils } = ethers;
  const { hexlify, hexConcat, hexZeroPad } = utils;
  const ERC721Enumerable = await ethers.getContract("ERC721Enumerable");
  const ERC721A = await ethers.getContract("ERC721A");
  const ERC721OZ = await ethers.getContract("ERC721OZ");
  const ERC721Naomsa = await ethers.getContract("ERC721Naomsa");
  const users = await getUnnamedAccounts();
  const bar = new SingleBar({});

  const indexesLength = 128;
  bar.start(indexesLength, 0);
  // Make benchmark for length from 1 to indexesLength
  const gas = await Promise.all(
    [...Array(indexesLength).keys()].map(async (i) => {
      const indexes = [...Array(i + 1).keys()];
      const bytes2Indexes = hexConcat(
        indexes.map((index) => hexZeroPad(hexlify([index]), 2))
      );

      const erc721EnumerableGas =
        await ERC721Enumerable.estimateGas.safeMintBatch(bytes2Indexes);
      const erc721AGas = await ERC721A.estimateGas.safeMintBatch(
        users[0],
        i + 1
      );
      const erc721OZGas = await ERC721OZ.estimateGas.safeMintBatch(
        users[0],
        indexes
      );
      const erc721NaomsaGas = await ERC721Naomsa.estimateGas.safeMintBatch(
        users[0],
        indexes
      );
      bar.increment();
      return {
        erc721EnumerableGas: erc721EnumerableGas.toNumber(),
        erc721AGas: erc721AGas.toNumber(),
        erc721OZGas: erc721OZGas.toNumber(),
        erc721NaomsaGas: erc721NaomsaGas.toNumber(),
      };
    })
  );
  bar.stop();

  fs.writeFileSync("./data/mintBatch.json", JSON.stringify(gas, null, 2));
});
