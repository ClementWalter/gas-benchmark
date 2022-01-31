// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./WriteBatchIndexesAndAddresses.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

import "hardhat/console.sol";

contract CheckAndWriteBatchIndexesAndAddresses is
    WriteBatchIndexesAndAddresses
{
    bool[10_000] tokenExistsBytes2;
    bool[10_000] tokenExistsUint16;

    function loopTokenIds256ToAddressMapping(uint256[] memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < input.length; i++) {
            require(
                tokenIds256ToAddressMapping[input[i]] == address(0),
                "ERC721: token already exists"
            );
            tokenIds256ToAddressMapping[input[i]] = msg.sender;
        }
    }

    function loopTokenIds16ToAddressMapping(uint16[] memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < input.length; i++) {
            require(
                tokenIds16ToAddressMapping[input[i]] == address(0),
                "ERC721: token already exists"
            );
            tokenIds16ToAddressMapping[input[i]] = msg.sender;
        }
    }

    function loopPushAddressToTokenIds256(uint256[] memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            uint256[] memory tokens = addressToTokenIds256Mapping[addresses[i]];
            for (uint256 j = 0; j < tokens.length; j++) {
                for (uint256 k = 0; k < input.length; k++) {
                    require(
                        tokens[j] != input[k],
                        "ERC721: token already exists"
                    );
                }
            }
        }
        for (uint256 i = 0; i < input.length; i++) {
            addressToTokenIds256Mapping[msg.sender].push(input[i]);
        }
    }

    function loopPushAddressToTokenIds16(uint16[] memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            uint16[] memory tokens = addressToTokenIds16Mapping[addresses[i]];
            for (uint256 j = 0; j < tokens.length; j++) {
                for (uint256 k = 0; k < input.length; k++) {
                    console.log("Checking %s against %s", tokens[j], input[k]);
                    require(
                        tokens[j] != input[k],
                        "ERC721: token already exists"
                    );
                }
            }
        }
        console.log("BEFORE");
        for (uint256 i = 0; i < input.length; i++) {
            addressToTokenIds16Mapping[msg.sender].push(input[i]);
        }
        console.log("AFTER");
    }

    function loopPushAddressToTokenIds16BoolIndexes(uint16[] memory input)
        public
        virtual
    {
        for (uint256 i = 0; i < input.length; i++) {
            require(
                !tokenExistsUint16[input[i]],
                "ERC721: token already exists"
            );
            addressToTokenIds16Mapping[msg.sender].push(input[i]);
            tokenExistsUint16[input[i]] = true;
        }
    }

    function concatBytes32ForAddress(bytes memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            bytes memory tokens = addressToTokenIdsBytes32Mapping[addresses[i]];
            for (uint256 j = 0; j < tokens.length; j += 32) {
                for (uint256 k = 0; k < input.length; k += 32) {
                    require(
                        BytesLib.toUint256(tokens, j) !=
                            BytesLib.toUint256(input, k),
                        "ERC721: token already exists"
                    );
                }
            }
        }
        addressToTokenIdsBytes32Mapping[msg.sender] = bytes.concat(
            addressToTokenIdsBytes32Mapping[msg.sender],
            input
        );
    }

    function concatBytes2ForAddress(bytes memory input)
        public
        virtual
        override
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            bytes memory tokens = addressToTokenIdsBytes2Mapping[addresses[i]];
            for (uint256 j = 0; j < tokens.length; j += 2) {
                for (uint256 k = 0; k < input.length; k += 2) {
                    require(
                        BytesLib.toUint16(tokens, j) !=
                            BytesLib.toUint16(input, k),
                        "ERC721: token already exists"
                    );
                }
            }
        }
        addressToTokenIdsBytes2Mapping[msg.sender] = bytes.concat(
            addressToTokenIdsBytes2Mapping[msg.sender],
            input
        );
    }

    function concatBytes2ForAddressBoolIndexes(bytes memory input)
        public
        virtual
    {
        for (uint256 i = 0; i < input.length; i += 2) {
            require(
                !tokenExistsBytes2[BytesLib.toUint16(input, i)],
                "ERC721: token already exists"
            );
            tokenExistsBytes2[BytesLib.toUint16(input, i)] = true;
        }
        addressToTokenIdsBytes2Mapping[msg.sender] = bytes.concat(
            addressToTokenIdsBytes2Mapping[msg.sender],
            input
        );
    }
}
