// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IFuseBlock {
    function getRequirementStatus(uint256 _tokenId) external view returns(bool);
}

contract Item is ERC1155, Ownable{
    struct ItemInfo {
        string itemUUID;
        uint256 auraAmount;
        string tokenURI;
    }

    struct FuseBlockInfo {
        uint256 auraAmount;
        uint256[] itemIds;
        uint256[] itemAmounts;
        address receiver;
    }

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    address public auraAddress;
    address public fuseBlockAddress;
    mapping(uint256 => ItemInfo) items;
    mapping(uint256 => FuseBlockInfo) fuseBlockItems;

    // itemId => fuseBlockId
    mapping(uint256 => uint256) fuseBlockIds;

    string DEFAULT_URI= "https://ipfs.io/ipfs/QmbaD9hWLx3hu2yzH1Uo7mu6236jnekC9dzmxHM3NKvKhL/1.png";

    constructor (address _auraAddress, address _fuseBlockAddress) ERC1155 ("") {
        auraAddress = _auraAddress;
        fuseBlockAddress = _fuseBlockAddress;
        _tokenIdCounter.increment();
    }

    modifier onlyFuseBlock() {
        require(msg.sender == fuseBlockAddress);
        _;
    }

    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        if (bytes(items[_tokenId].tokenURI).length != 0) {
            return items[_tokenId].tokenURI;
        } else {
            return DEFAULT_URI;
        }
    }

    function cancelItems(uint256 _fuseBlockId) external onlyFuseBlock {
        //return back aura to fuseblock
        FuseBlockInfo memory fuseBlockItem = fuseBlockItems[_fuseBlockId];
        IERC20(auraAddress).transfer(tx.origin, fuseBlockItem.auraAmount);
        _burnBatch(fuseBlockItem.receiver, fuseBlockItem.itemIds, fuseBlockItem.itemAmounts);
    }

    function setURI(uint256 _tokenId, string memory _uri) public onlyOwner {
        items[_tokenId].tokenURI = _uri;
    }

    function mint(uint256 _fuseBlockId, address _receiver, string memory _itemUUID, uint256 _quantity, uint256 _auraAmount) public onlyFuseBlock{
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
        
        items[tokenId] = ItemInfo({itemUUID: _itemUUID, auraAmount: _auraAmount, tokenURI: ""});
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
        require(IFuseBlock(fuseBlockAddress).getRequirementStatus(getFuseBlockIdFromItemId(id)), "fuseblock requirement not mint");
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
}