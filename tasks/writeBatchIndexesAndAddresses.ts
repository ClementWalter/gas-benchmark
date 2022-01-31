import { task } from "hardhat/config";
import fs from "fs";
import { SingleBar } from "cli-progress";

task(
  "write-batch-indexes-and-addresses",
  "Estimate gas for different way of batch writing indexes and owner addresses to a contract's storage"
).setAction(async ({}, { ethers }) => {
  const { utils } = ethers;
  const { hexlify, hexConcat, hexZeroPad } = utils;
  const WriteBatchIndexesAndAddresses = await ethers.getContract(
    "WriteBatchIndexesAndAddresses"
  );
  const bar = new SingleBar({});

  const indexesLength = 128;
  bar.start(indexesLength, 0);
  // Make benchmark for length from 1 to indexesLength
  const gas = await Promise.all(
    [...Array(indexesLength).keys()].map(async (i) => {
      const indexes = [...Array(i + 1).keys()];
      const bytes32Indexes = indexes.map((index) =>
        hexZeroPad(hexlify([index]), 32)
      );
      const bytes2Indexes = indexes.map((index) =>
        hexZeroPad(hexlify([index]), 2)
      );
      // address is 20 bytes so we just put any 20 bytes long input
      const addresses = indexes.map((index) =>
        hexZeroPad(hexlify([index]), 20)
      );

      const loopTokenIds256ToAddressMapping =
        await WriteBatchIndexesAndAddresses.estimateGas.loopTokenIds256ToAddressMapping(
          indexes
        );
      const loopTokenIds16ToAddressMapping =
        await WriteBatchIndexesAndAddresses.estimateGas.loopTokenIds16ToAddressMapping(
          indexes
        );
      const loopPushAddressToTokenIds256 =
        await WriteBatchIndexesAndAddresses.estimateGas.loopPushAddressToTokenIds256(
          indexes
        );
      const loopPushAddressToTokenIds16 =
        await WriteBatchIndexesAndAddresses.estimateGas.loopPushAddressToTokenIds16(
          indexes
        );
      const loopPushUint256AndAddress =
        await WriteBatchIndexesAndAddresses.estimateGas.loopPushUint256AndAddress(
          indexes
        );
      const loopPushUint16AndAddress =
        await WriteBatchIndexesAndAddresses.estimateGas.loopPushUint16AndAddress(
          indexes
        );
      const concatBytes32ForAddress =
        await WriteBatchIndexesAndAddresses.estimateGas.concatBytes32ForAddress(
          hexConcat(bytes32Indexes)
        );
      const concatBytes2ForAddress =
        await WriteBatchIndexesAndAddresses.estimateGas.concatBytes2ForAddress(
          hexConcat(bytes2Indexes)
        );

      const concatBytes = await WriteBatchIndexesAndAddresses.estimateGas[
        "concatBytes(bytes,bytes)"
      ](hexConcat(bytes32Indexes), hexConcat(addresses));
      const concatBytesLoopAddress =
        await WriteBatchIndexesAndAddresses.estimateGas.concatBytesLoopAddress(
          hexConcat(bytes32Indexes)
        );
      return {
        loopTokenIds256ToAddressMapping:
          loopTokenIds256ToAddressMapping.toNumber(),
        loopTokenIds16ToAddressMapping:
          loopTokenIds16ToAddressMapping.toNumber(),
        loopPushAddressToTokenIds256: loopPushAddressToTokenIds256.toNumber(),
        loopPushAddressToTokenIds16: loopPushAddressToTokenIds16.toNumber(),
        loopPushUint256AndAddress: loopPushUint256AndAddress.toNumber(),
        loopPushUint16AndAddress: loopPushUint16AndAddress.toNumber(),
        concatBytes2ForAddress: concatBytes2ForAddress.toNumber(),
        concatBytes32ForAddress: concatBytes32ForAddress.toNumber(),
        concatBytes: concatBytes.toNumber(),
        concatBytesLoopAddress: concatBytesLoopAddress.toNumber(),
      };
    })
  );
  bar.stop();

  fs.writeFileSync(
    "./data/writeBatchIndexesAndAddresses.json",
    JSON.stringify(gas, null, 2)
  );
});
