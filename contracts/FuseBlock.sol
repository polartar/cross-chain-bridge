// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

interface IItem {
    function mint(uint256 _fuseBlockId, address _address, string memory _tokenId, uint256 _quantity, uint256 _auraAmount) external;
    function cancelItems(uint256 _fuseBlockId) external;
}

contract FuseBlock is UUPSUpgradeable, ERC721Upgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter public _tokenIdCounter;

    address public auraAddress;
    mapping(uint256 => uint256) auraAmounts;
    mapping(uint256 => bool) meetRequirements;
    string baseURI;
    uint256 minAuraAmount;
    uint16 rate;  // 50 means 0.5
    uint8 constant public SCALE = 100;
    bool public isRealAura;

    address itemAddress;
    mapping(uint256 => uint256) vAuraAmounts;

    function initialize(address _auraAddress) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        __ERC721_init("Infuse NFT", "NFT");
        
        auraAddress = _auraAddress;
        _tokenIdCounter.increment();
        minAuraAmount = 2 ether;
        rate = 100;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    function setItemAddress(address _newItemAddress) external onlyOwner {
        itemAddress = _newItemAddress;
    }

    function getTotalAuraAmount() public view onlyOwner returns(uint256) {
        return _getTotalAuraAmount();
    }

    function _getTotalAuraAmount() private view returns(uint256) {
        return IERC20Upgradeable(auraAddress).balanceOf(address(this));
    }

    function setRealAuraAddress(address _newAuraAddress, uint16 _rate) external onlyOwner {
        require(_rate > 0 && _rate <= 100, "rate should be within 1-100");
        rate = _rate;
        isRealAura = true;
        auraAddress = _newAuraAddress;
    }

    // set minimum aura amount for mint
    function setMinAuraAmount(uint256 _minAuraAmount) external onlyOwner {
        minAuraAmount = _minAuraAmount;
    }

    // mint fuseblock for promotion
    function mint(address _address, uint256 _auraAmount) public onlyOwner{
        require(_auraAmount >= minAuraAmount, "should include minimum aura");
        uint256 tokenId = _tokenIdCounter.current();
        IERC20Upgradeable(auraAddress).transferFrom(msg.sender, address(this), _auraAmount);
        _safeMint(_address, tokenId);
        if (isRealAura) {
            vAuraAmounts[tokenId] = _auraAmount;
        } else {
            auraAmounts[tokenId] = _auraAmount; 
        }
        _tokenIdCounter.increment();
    }

    // get requirement status
    function getRequirementStatus(uint256 _tokenId) public view returns(bool) {
        return meetRequirements[_tokenId];
    }

    function setRequirementStatus(uint256 _tokenId, bool _status) external onlyOwner {
        meetRequirements[_tokenId] = _status;
    }

    // cancel the fuseblock, get back $aura, cancel item NFT
    function cancelFuseblock(uint256 _tokenId) external onlyOwner {
        require(!meetRequirements[_tokenId], "meet requirement");
        IItem(itemAddress).cancelItems(_tokenId);
        burn(_tokenId);
    }

    // mint Item from fuseBlock
    function mintItem(uint256 _fuseBlockId, string memory _itemUUID, uint256 _quantity, uint256 _auraAmount) external{
        require(itemAddress != address(0), "item NFT not set");
        require(ownerOf(_fuseBlockId) == msg.sender, "not token owner");
        require(_auraAmount >= 0, "invalid aura amount");
        uint256 _totalAmount = _auraAmount * _quantity;

        uint256 auraAmount = getAuraAmount(_fuseBlockId);
        require(auraAmount >= _totalAmount, "insufficient aura balance");

        if (isRealAura) {
            if (vAuraAmounts[_fuseBlockId] > 0) {
                vAuraAmounts[_fuseBlockId] = vAuraAmounts[_fuseBlockId] - _totalAmount;
            } else {
                auraAmounts[_fuseBlockId] = auraAmounts[_fuseBlockId] - _totalAmount * SCALE / rate;
            }
        } else {
            auraAmounts[_fuseBlockId] = auraAmounts[_fuseBlockId] - _totalAmount;
        }

        IERC20Upgradeable(auraAddress).transfer(itemAddress, _totalAmount);
        IItem(itemAddress).mint(_fuseBlockId, msg.sender, _itemUUID, _quantity, _auraAmount);
    }

    // get Aura amount for the fuseBlock
    function getAuraAmount(uint256 _tokenId) public view returns (uint256) {
        if (isRealAura) {
            if (vAuraAmounts[_tokenId] > 0) {
                return vAuraAmounts[_tokenId];
            } else {
                return auraAmounts[_tokenId] * rate / SCALE;
            }
        }
        return auraAmounts[_tokenId];
    }

    // get aura amounts and token uris from the tokenIDs
    function getFuseBlockInfo(uint256[] calldata _tokenIds) public view returns(uint256[] memory, string[] memory) {
        uint256 length = _tokenIds.length;
        uint256[] memory amounts = new uint256[](length);
        string[] memory uris = new string[](length); 

        for (uint256 i = 0; i < length;) {
            amounts[i] = getAuraAmount(_tokenIds[i]);
            uris[i] = tokenURI(_tokenIds[i]);
            unchecked {
                ++i;
            }
        }

        return (amounts, uris);
    }

    function burn(uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId) || msg.sender == owner(), "not owner of the token");

        if (auraAmounts[_tokenId] > 0) {
           IERC20Upgradeable(auraAddress).transfer(msg.sender, auraAmounts[_tokenId]); 
           auraAmounts[_tokenId] = 0;
        } else if (vAuraAmounts[_tokenId] > 0) {
           IERC20Upgradeable(auraAddress).transfer(msg.sender, vAuraAmounts[_tokenId]); 
           vAuraAmounts[_tokenId] = 0;
        }

        _burn(_tokenId);
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
      require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");

      string memory _tokenURI = string(abi.encodePacked(baseURI, "?tokenId=", StringsUpgradeable.toString(_tokenId)));

      return _tokenURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override virtual {
        if (address(0) != to && address(0) != from && !meetRequirements[tokenId]) {
            revert("requirement not meet");
        }
    }
}