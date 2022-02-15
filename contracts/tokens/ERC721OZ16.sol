// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import {ERC721OZ16 as ERC721} from "../base/ERC721OZ16.sol";

contract ERC721OZ16 is ERC721 {
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    function safeMintBatch(address _to, uint16[] memory _ids) public {
        require(_to != address(0));
        require(_ids.length > 0);
        for (uint256 i = 0; i < _ids.length; i++) {
            ERC721._safeMint(_to, _ids[i]);
        }
    }
}
