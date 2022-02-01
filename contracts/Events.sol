// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Events {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool indexed approved
    );

    function emptyFunction(address, address, uint256) public {
    }

    function emitTransfer(address from, address to, uint256 tokenId) public {
        emit Transfer(from, to, tokenId);
    }

    function emitApproval(address owner, address approved, uint256 tokenId) public {
        emit Approval(owner, approved, tokenId);
    }

    function emitApprovalForAll(address owner, address operator, bool approved) public {
        emit ApprovalForAll(owner, operator, approved);
    }
}
