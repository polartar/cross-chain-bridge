// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721A/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DevToken is ERC721A, Ownable {
    using Strings for uint256;
    string public baseTokenURI;

    constructor() ERC721A("DevToken", "DT") {}

    function mint(address _receiver, uint256 _quantity) external onlyOwner {
        _mint(_receiver, _quantity);
    }

    function buyToken(address _from, uint256 _tokenId) public payable {
        require(msg.value != 0, "should pay more than 0");
        require(
            !_isTransferrable[_from][_tokenId],
            "developers can't sell the token"
        );
        _transferFrom(_from, msg.sender, _tokenId);
    }

    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }
}
