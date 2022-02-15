// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC721OZ16Enumerable as ERC721Enumerable, ERC721OZ16 as ERC721} from "../base/ERC721OZ16Enumerable.sol";

contract ERC721OZ16Enumerable is ERC721Enumerable {
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    function safeMintBatch(address _to, uint16[] memory _ids) public {
        require(_to != address(0));
        require(_ids.length > 0);
        for (uint256 i = 0; i < _ids.length; i++) {
            ERC721._safeMint(_to, _ids[i]);
        }
    }
}
