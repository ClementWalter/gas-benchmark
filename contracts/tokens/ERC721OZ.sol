// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ERC721OZ is ERC721Enumerable {
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    function safeMintBatch(address _to, uint256[] memory _ids) public {
        require(_to != address(0));
        require(_ids.length > 0);
        for (uint256 i = 0; i < _ids.length; i++) {
            ERC721._safeMint(_to, _ids[i]);
        }
    }
}
