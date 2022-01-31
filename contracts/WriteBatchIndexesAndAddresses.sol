// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./WriteBatchIndexes.sol";

contract WriteBatchIndexesAndAddresses is WriteBatchIndexes {
    mapping(uint256 => address) public tokenIds256ToAddressMapping;
    mapping(uint16 => address) public tokenIds16ToAddressMapping;
    mapping(address => uint256[]) public addressToTokenIds256Mapping;
    mapping(address => uint16[]) public addressToTokenIds16Mapping;
    mapping(address => bytes) public addressToTokenIdsBytes32Mapping;
    mapping(address => bytes) public addressToTokenIdsBytes2Mapping;

    address[] public addresses;
    bytes public addressesBytes;

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }

    function setAddresses(address[] memory _addresses) public {
        addresses = _addresses;
    }

    function getTokenIds16Mapping(address owner)
        public
        view
        returns (uint16[] memory)
    {
        return addressToTokenIds16Mapping[owner];
    }

    function loopTokenIds256ToAddressMapping(uint256[] memory input)
        public
        virtual
    {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIds256ToAddressMapping[input[i]] = msg.sender;
        }
    }

    function loopTokenIds16ToAddressMapping(uint16[] memory input)
        public
        virtual
    {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIds16ToAddressMapping[input[i]] = msg.sender;
        }
    }

    function loopPushAddressToTokenIds256(uint256[] memory input)
        public
        virtual
    {
        for (uint256 i = 0; i < input.length; i++) {
            addressToTokenIds256Mapping[msg.sender].push(input[i]);
        }
    }

    function loopPushAddressToTokenIds16(uint16[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            addressToTokenIds16Mapping[msg.sender].push(input[i]);
        }
    }

    function concatBytes32ForAddress(bytes memory input) public virtual {
        addressToTokenIdsBytes32Mapping[msg.sender] = bytes.concat(
            addressToTokenIdsBytes32Mapping[msg.sender],
            input
        );
    }

    function concatBytes2ForAddress(bytes memory input) public virtual {
        addressToTokenIdsBytes2Mapping[msg.sender] = bytes.concat(
            addressToTokenIdsBytes2Mapping[msg.sender],
            input
        );
    }

    function loopPushUint256AndAddress(uint256[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsUint256.push(input[i]);
            addresses.push(msg.sender);
        }
    }

    function loopPushUint16AndAddress(uint16[] memory input) public virtual {
        for (uint256 i = 0; i < input.length; i++) {
            tokenIdsUint16.push(input[i]);
            addresses.push(msg.sender);
        }
    }

    function concatBytes(bytes memory input, bytes memory _newAddresses)
        public
        virtual
    {
        tokenIdsBytes = bytes.concat(tokenIdsBytes, input);
        addressesBytes = bytes.concat(addressesBytes, _newAddresses);
    }

    function concatBytesLoopAddress(bytes memory input) public virtual {
        tokenIdsBytes = bytes.concat(tokenIdsBytes, input);
        for (uint256 i = 0; i < input.length; i += 32) {
            addressesBytes = bytes.concat(addressesBytes, bytes20(msg.sender));
        }
    }
}
