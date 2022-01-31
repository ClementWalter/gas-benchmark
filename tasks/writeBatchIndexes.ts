import { task } from "hardhat/config";
import fs from "fs";
import { SingleBar } from "cli-progress";

task(
  "write-batch-indexes",
  "Estimate gas for different way of batch writing indexes to a contract's storage"
).setAction(async ({}, { ethers }) => {
  const { utils } = ethers;
  const { hexlify, hexConcat, hexZeroPad } = utils;
  const WriteBatchIndexes = await ethers.getContract("WriteBatchIndexes");
  const bar = new SingleBar({});

  const indexesLength = 128;
  bar.start(indexesLength, 0);
  // Make benchmark for length from 1 to 256
  const gas = await Promise.all(
    [...Array(indexesLength).keys()].map(async (i) => {
      const indexes = [...Array(i + 1).keys()];
      const bytes32Indexes = indexes.map((index) =>
        hexZeroPad(hexlify([index]), 32)
      );
      const bytes2Indexes = indexes.map((index) =>
        hexZeroPad(hexlify([index]), 2)
      );

      // Naive loop with uint
      const loopPushUint256 =
        await WriteBatchIndexes.estimateGas.loopPushUint256(indexes);
      const loopPushUint16 = await WriteBatchIndexes.estimateGas.loopPushUint16(
        indexes
      );
      const loopPushMemoryUint256 =
        await WriteBatchIndexes.estimateGas.loopPushMemoryUint256(indexes);
      const loopPushMemoryUint16 =
        await WriteBatchIndexes.estimateGas.loopPushMemoryUint16(indexes);

      // Direct bytes concatenation
      const concatBytes32 = await WriteBatchIndexes.estimateGas.concatBytes(
        hexConcat(bytes32Indexes)
      );
      const concatBytes2 = await WriteBatchIndexes.estimateGas.concatBytes(
        hexConcat(bytes2Indexes)
      );
      const abiEncodeConcatBytes32 =
        await WriteBatchIndexes.estimateGas.abiEncodeConcat(
          hexConcat(bytes32Indexes)
        );
      const abiEncodeConcatBytes2 =
        await WriteBatchIndexes.estimateGas.abiEncodeConcat(
          hexConcat(bytes2Indexes)
        );

      // Loop but with bytes.concat instead of push
      const loopConcatBytes32 =
        await WriteBatchIndexes.estimateGas.loopConcatBytes(bytes32Indexes);
      const loopConcatBytes2 =
        await WriteBatchIndexes.estimateGas.loopConcatBytes2(bytes2Indexes);
      bar.update(i);

      return {
        loopPushUint256: loopPushUint256.toNumber(),
        loopPushUint16: loopPushUint16.toNumber(),
        loopPushMemoryUint256: loopPushMemoryUint256.toNumber(),
        loopPushMemoryUint16: loopPushMemoryUint16.toNumber(),
        concatBytes32: concatBytes32.toNumber(),
        concatBytes2: concatBytes2.toNumber(),
        abiEncodeConcatBytes32: abiEncodeConcatBytes32.toNumber(),
        abiEncodeConcatBytes2: abiEncodeConcatBytes2.toNumber(),
        loopConcatBytes32: loopConcatBytes32.toNumber(),
        loopConcatBytes2: loopConcatBytes2.toNumber(),
      };
    })
  );
  bar.stop();

  fs.writeFileSync(
    "./data/writeBatchIndexes.json",
    JSON.stringify(gas, null, 2)
  );
});
