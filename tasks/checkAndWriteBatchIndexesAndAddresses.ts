import { task } from "hardhat/config";
import fs from "fs";
import { SingleBar } from "cli-progress";

task(
  "check-and-write-batch-indexes-and-addresses",
  "Estimate gas for different way of batch checking non-existence and writing indexes and owner addresses to a contract's storage"
).setAction(async ({}, { ethers, getUnnamedAccounts, deployments }) => {
  const { utils } = ethers;
  const { hexlify, hexConcat, hexZeroPad } = utils;
  const CheckAndWriteBatchIndexesAndAddresses = await ethers.getContract(
    "CheckAndWriteBatchIndexesAndAddresses"
  );
  const bar = new SingleBar({});
  const users = await getUnnamedAccounts();
  const { execute } = deployments;
  const gas = [];
  const indexesLength = 128;
  bar.start(indexesLength, 0);
  await CheckAndWriteBatchIndexesAndAddresses.setAddresses(users);
  for (let i = 0; i < indexesLength; i++) {
    const user = users[i % users.length];

    // Fill the storage with the new token
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "loopTokenIds256ToAddressMapping",
      [i]
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "loopTokenIds16ToAddressMapping",
      [i]
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "loopPushAddressToTokenIds256",
      [i]
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "loopPushAddressToTokenIds16",
      [i]
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "loopPushAddressToTokenIds16BoolIndexes",
      [i]
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "concatBytes32ForAddress",
      hexZeroPad(hexlify([i]), 32)
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "concatBytes2ForAddress",
      hexZeroPad(hexlify([i]), 2)
    );
    await execute(
      "CheckAndWriteBatchIndexesAndAddresses",
      { from: user },
      "concatBytes2ForAddressBoolIndexes",
      hexZeroPad(hexlify([i]), 2)
    );

    // Estimate gas of adding a batch of indexesLength new tokens
    const newTokens = [...Array(indexesLength + i + 1).keys()].slice(i + 1);
    const loopTokenIds256ToAddressMapping =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.loopTokenIds256ToAddressMapping(
        newTokens
      );
    const loopTokenIds16ToAddressMapping =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.loopTokenIds16ToAddressMapping(
        newTokens
      );
    const loopPushAddressToTokenIds256 =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.loopPushAddressToTokenIds256(
        newTokens
      );
    const loopPushAddressToTokenIds16 =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.loopPushAddressToTokenIds16(
        newTokens
      );
    const loopPushAddressToTokenIds16BoolIndexes =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.loopPushAddressToTokenIds16BoolIndexes(
        newTokens
      );
    const concatBytes32ForAddress =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.concatBytes32ForAddress(
        hexConcat(newTokens.map((i) => hexZeroPad(hexlify([i]), 32)))
      );
    const concatBytes2ForAddress =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.concatBytes2ForAddress(
        hexConcat(newTokens.map((i) => hexZeroPad(hexlify([i]), 2)))
      );
    const concatBytes2ForAddressBoolIndexes =
      await CheckAndWriteBatchIndexesAndAddresses.estimateGas.concatBytes2ForAddressBoolIndexes(
        hexConcat(newTokens.map((i) => hexZeroPad(hexlify([i]), 2)))
      );
    //
    bar.increment();
    gas.push({
      loopTokenIds256ToAddressMapping:
        loopTokenIds256ToAddressMapping.toNumber(),
      loopTokenIds16ToAddressMapping: loopTokenIds16ToAddressMapping.toNumber(),
      loopPushAddressToTokenIds256: loopPushAddressToTokenIds256.toNumber(),
      loopPushAddressToTokenIds16: loopPushAddressToTokenIds16.toNumber(),
      loopPushAddressToTokenIds16BoolIndexes:
        loopPushAddressToTokenIds16BoolIndexes.toNumber(),
      concatBytes32ForAddress: concatBytes32ForAddress.toNumber(),
      concatBytes2ForAddress: concatBytes2ForAddress.toNumber(),
      concatBytes2ForAddressBoolIndexes:
        concatBytes2ForAddressBoolIndexes.toNumber(),
    });
  }
  bar.stop();

  fs.writeFileSync(
    "./data/checkAndWriteBatchIndexesAndAddresses.json",
    JSON.stringify(gas, null, 2)
  );
});
