// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
  constructor()ERC721("Mock NFT", "MN") {
    }
  function mint(address _sender, uint256 _tokenId) public {
    _mint(_sender, _tokenId);
  }
}