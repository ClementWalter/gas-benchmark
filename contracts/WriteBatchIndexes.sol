// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WriteBatchIndexes {
    uint256[] tokenIdsUint256;
    uint16[] tokenIdsUint16;
    bytes tokenIdsBytes;

    function pushUsingMemory(uint256[] memory base, uint256[] memory input)
        public
        pure
        returns (uint256[] memory)
    {
        uint256[] memory _tmp = new uint256[](base.length + input.length);
        for (uint256 i = 0; i < base.length; i++) {
            _tmp[i] = base[i];
        }
        for (uint256 i = 0; i < input.length; i++) {
            _tmp[base.length + i] = input[i];
        }
        return _tmp;
    }

    function pushUsingMemory(uint16[] memory base, uint16[] memory input)
        public
        pure
        returns (uint16[] memory)
    {
        uint16[] memory _tmp = new uint16[](base.length + input.length);
        for (uint256 i = 0; i < base.length; i++) {
            _tmp[i] = base[i];
        }
        for (uint256 i = 0; i < input.length; i++) {
            _tmp[base.length + i] = input[i];
        }
        return _tmp;
    }

    function loopPushUint256(uint256[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsUint256.push(input[i]);
        }
    }

    function loopPushUint16(uint16[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsUint16.push(input[i]);
        }
    }

    function loopPushMemoryUint256(uint256[] memory input) public virtual {
        tokenIdsUint256 = pushUsingMemory(tokenIdsUint256, input);
    }

    function loopPushMemoryUint16(uint16[] memory input) public virtual {
        tokenIdsUint16 = pushUsingMemory(tokenIdsUint16, input);
    }

    function concatBytes(bytes memory input) public virtual {
        tokenIdsBytes = bytes.concat(tokenIdsBytes, input);
    }

    function abiEncodeConcat(bytes memory input) public virtual {
        tokenIdsBytes = abi.encodePacked(tokenIdsBytes, input);
    }

    function loopConcatBytes(bytes[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsBytes = bytes.concat(tokenIdsBytes, input[i]);
        }
    }

    function loopConcatBytes2(bytes2[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsBytes = bytes.concat(tokenIdsBytes, input[i]);
        }
    }
}
