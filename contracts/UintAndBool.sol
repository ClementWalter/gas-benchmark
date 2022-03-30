//SPDX-License-Identifier:MIT
pragma solidity 0.8.12;

import "hardhat/console.sol";

contract UintAndBool {
    uint8 public uint8Value;
    bool public boolValue;
    uint8 initialValue;

    constructor() {
        uint8Value = 0;
        boolValue = false;
    }

    function init(uint8 _value) public {
        initialValue = _value;
    }

    function setUint8(uint8 _value) public {
        uint8Value = _value;
    }

    function setBool(bool _value) public {
        boolValue = _value;
    }
}
