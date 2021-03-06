// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721OZ is ERC721 {
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    function safeMintBatch(address _to, uint256[] memory _ids) public {
        require(_to != address(0));
        require(_ids.length > 0);
        for (uint256 i = 0; i < _ids.length; i++) {
            ERC721._safeMint(_to, _ids[i]);
        }
    }
}
