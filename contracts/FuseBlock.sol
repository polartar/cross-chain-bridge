// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FuseBlock is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    address public auraAddress;
    mapping(uint256 => uint256) auraAmounts;
    string baseURI = "ipfs://test";
    uint256 minAuraAmount;
    uint16 rate;
    uint16 constant public SCALE = 100;
    bool public isRealAura;

    constructor (address _auraAddress) ERC721 ("Infuse NFT", "NFT") {
        auraAddress = _auraAddress;
        _tokenIdCounter.increment();
        minAuraAmount = 2 ether;
        rate = 100;
    }

    function setRealAuraAddress(address _newAuraAddress) external onlyOwner {
        isRealAura = true;
        auraAddress = _newAuraAddress;
    }

    function setMinAuraAmount(uint256 _minAuraAmount) external onlyOwner {
        minAuraAmount = _minAuraAmount;
    }

    function mint(uint256 _amount) public {
        require(_amount > 0, "invalid amount");
        require(_amount >= minAuraAmount, "should include minimum aura");

        uint256 tokenId = _tokenIdCounter.current();
        IERC20(auraAddress).transferFrom(msg.sender, address(this), _amount);
        _safeMint(msg.sender, tokenId);
        auraAmounts[tokenId] = _amount;
        _tokenIdCounter.increment();
    }

    function setRate(uint16 _rate) external onlyOwner {
        require(_rate > 0 && _rate <= 100, "rate should be within 1-100");
        rate = _rate;
    }

    function getAuraAmount(uint256 _tokenId) external view returns (uint256) {
        if (isRealAura) {
            return auraAmounts[_tokenId] * rate / SCALE;
        }
        return auraAmounts[_tokenId];
    }

    function burn(uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId), "not owner of the token");
        uint256 amount = auraAmounts[_tokenId];
        
        auraAmounts[_tokenId] = 0;
        IERC20(auraAddress).transfer(msg.sender, amount);
        _burn(_tokenId);
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
      require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");

      string memory _tokenURI = string(abi.encodePacked(baseURI, "/", Strings.toString(_tokenId), ".json"));

      return _tokenURI;
    }
}