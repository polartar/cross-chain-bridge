// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
interface IFuseBlock {
    function getRequirementStatus(uint256 _tokenId) external view returns(bool);
}

contract Item is UUPSUpgradeable, ERC1155Upgradeable, OwnableUpgradeable{
    struct ItemInfo {
        string itemUUID;
        uint256 auraAmount;
    }

    struct FuseBlockInfo {
        uint256 auraAmount;
        uint256[] itemIds;
        uint256[] itemAmounts;
        address receiver;
    }

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter public _tokenIdCounter;

    address public auraAddress;
    address public fuseBlockAddress;
    mapping(uint256 => ItemInfo) items;
    mapping(uint256 => FuseBlockInfo) fuseBlockItems;

    // itemId => fuseBlockId
    mapping(uint256 => uint256) fuseBlockIds;

    address rgnAddress;

    // constructor (address _auraAddress, address _fuseBlockAddress) ERC1155 ("") {
    //     auraAddress = _auraAddress;
    //     fuseBlockAddress = _fuseBlockAddress;
    //     _tokenIdCounter.increment();
    // }

    function initialize(address _auraAddress, address _fuseBlockAddress) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        __ERC1155_init("");
        
        auraAddress = _auraAddress;
        fuseBlockAddress = _fuseBlockAddress;
        _tokenIdCounter.increment();
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    modifier onlyFuseBlock() {
        require(msg.sender == fuseBlockAddress);
        _;
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function _uriFromUUID(string memory _uuid) private view returns(string memory) {
        string memory _tokenURI = string(abi.encodePacked(super.uri(1), "?id=", _uuid));
        return _tokenURI;
    }

    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        string memory firebaseID = items[_tokenId].itemUUID;
        return _uriFromUUID(firebaseID);
    }

    function cancelItems(uint256 _fuseBlockId) external onlyFuseBlock {
        //return back aura to fuseblock
        FuseBlockInfo memory fuseBlockItem = fuseBlockItems[_fuseBlockId];
        IERC20Upgradeable(auraAddress).transfer(tx.origin, fuseBlockItem.auraAmount);
        _burnBatch(fuseBlockItem.receiver, fuseBlockItem.itemIds, fuseBlockItem.itemAmounts);
    }

    function mint(uint256 _fuseBlockId, address _receiver, string memory _itemUUID, uint256 _quantity, uint256 _auraAmount) public onlyFuseBlock {
        require(_quantity > 0, "invalid quantity");
        require(_auraAmount > 0, "invalid aura amount");

        uint256 tokenId = _tokenIdCounter.current();
        _mint(_receiver, tokenId, _quantity, "");
        _tokenIdCounter.increment();

        FuseBlockInfo storage fuseBlockInfo = fuseBlockItems[_fuseBlockId];

        fuseBlockInfo.auraAmount += _quantity * _auraAmount;
        fuseBlockInfo.itemIds.push(tokenId);
        fuseBlockInfo.itemAmounts.push(_quantity);
        fuseBlockInfo.receiver = _receiver;
        
        items[tokenId] = ItemInfo({itemUUID: _itemUUID, auraAmount: _auraAmount});
        fuseBlockIds[tokenId] = _fuseBlockId;
    }

    function updateAuraAddress(address _newAuraAddress) external onlyOwner {
        auraAddress = _newAuraAddress;
    }

    function updateFuseBlockAddress(address _newFuseBlockAddress) external onlyOwner {
        fuseBlockAddress = _newFuseBlockAddress;
    }

    function getAuraAmount(uint256 _tokenId) public view returns (uint256) {
        return items[_tokenId].auraAmount;
    }

    function getItemsFromFuseBlock(uint256 _fuseBlockId) external view returns(FuseBlockInfo memory) {
        return fuseBlockItems[_fuseBlockId];
    }

    function getItemsInfo(uint256[] calldata _ids) external view returns(ItemInfo[] memory) {
        uint256 len = _ids.length;
        ItemInfo[] memory _items = new ItemInfo[](len);

        for (uint256 i = 0; i < len;) {
            _items[i] =  items[_ids[i]];
            unchecked {
                ++i;
            }
        }

        return _items;
    }

    function getFuseBlockIdFromItemId(uint256 _itemId) public view returns(uint256) {
        return fuseBlockIds[_itemId];
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        if (getFuseBlockIdFromItemId(id) != 0) {
            require(IFuseBlock(fuseBlockAddress).getRequirementStatus(getFuseBlockIdFromItemId(id)), "fuseblock requirement not mint");
        }
       
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override {
        revert("batch transfer not availble");
    }

    function setRGNAddress(address _newAddress) public onlyOwner {
        rgnAddress = _newAddress;
    }

    function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
        if (operator == rgnAddress) {
            return true;
        } else {
        return super.isApprovedForAll(account, operator);
        }
    }

    function infusedMint(address _receiver, string memory _itemUUID, uint256[] calldata _itemIds) public onlyOwner{
        uint256 len = _itemIds.length;
        require(len > 0, "invalid item count");
        uint256 amount;
        for (uint256 i = 0; i < len;) {
            if (getAuraAmount(_itemIds[i]) != 0) {
                amount += getAuraAmount(_itemIds[i]);
                removeItemFromFuseBlock(_itemIds[i]);
            } else {
                revert("invalid item id");
            }
            unchecked {
                ++i;
            }
        }
        

        uint256 tokenId = _tokenIdCounter.current();
        _mint(_receiver, tokenId, 1, "");
        _tokenIdCounter.increment();

        items[tokenId] = ItemInfo({itemUUID: _itemUUID, auraAmount: amount});
    }

    function removeItemFromFuseBlock(uint256 _itemId) private {
        uint256 fuseBlockId = getFuseBlockIdFromItemId(_itemId);  
        FuseBlockInfo storage fuseBlockInfo = fuseBlockItems[fuseBlockId];

        fuseBlockInfo.auraAmount -= getAuraAmount(_itemId);
        uint256 len = fuseBlockInfo.itemIds.length;
        for (uint256 i = 0; i < len;) {
            if (fuseBlockInfo.itemIds[i] == _itemId) {
                require(fuseBlockInfo.itemAmounts[i] >= 1, "already fused");
                fuseBlockInfo.itemAmounts[i] -= 1;
                if (fuseBlockInfo.itemAmounts[i] == 0) {
                    delete fuseBlockInfo.itemAmounts[i];
                }
            } 
            unchecked {
                ++i;
            }
        }
    }
}