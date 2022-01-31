import { task } from "hardhat/config";
import fs from "fs";

task("events", "Estimate gas for emitting ERC721 events").setAction(
  async ({}, { ethers }) => {
    const from = "0x0000000000000000000000000000000000000000";
    const to = "0x0000000000000000000000000000000000000001";
    const tokenId = 0;

    const Events = await ethers.getContract("Events");

    const emitTransfer = await Events.estimateGas.emitTransfer(
      from,
      to,
      tokenId
    );

    const emitApproval = await Events.estimateGas.emitApproval(
      from,
      to,
      tokenId
    );
    const emitApprovalForAll = await Events.estimateGas.emitApprovalForAll(
      from,
      to,
      true
    );

    const gas = {
      emitTransfer: emitTransfer.toNumber(),
      emitApproval: emitApproval.toNumber(),
      emitApprovalForAll: emitApprovalForAll.toNumber(),
    };
    fs.writeFileSync("./data/events.json", JSON.stringify(gas, null, 2));
  }
);
