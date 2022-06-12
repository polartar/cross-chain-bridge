// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Item is ERC1155, Ownable{
    struct ItemInfo {
        string itemUUID;
        uint256 auraAmount;
        string tokenURI;
    }
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    address public auraAddress;
    address public fuseBlockAddress;
    // mapping(uint256 => string) tokenURIs;
    // mapping(uint256 => uint256) auraAmounts;
    mapping(uint256 => ItemInfo) items;

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

    function setURI(uint256 _tokenId, string memory _uri) public onlyOwner {
        items[_tokenId].tokenURI = _uri;
    }

    function mint(address _receiver, string memory _itemUUID, uint256 _quantity, uint256 _auraAmount) public onlyFuseBlock{
        require(_quantity > 0, "invalid quantity");

        uint256 tokenId = _tokenIdCounter.current();
        _mint(_receiver, tokenId, _quantity, "");
        _tokenIdCounter.increment();

        items[tokenId] = ItemInfo({itemUUID: _itemUUID, auraAmount: _auraAmount, tokenURI: ""});
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

    function getItemsInfo(uint256[] calldata _ids) external view returns(ItemInfo[] memory) {
        uint256 len = _ids.length;
        ItemInfo[] memory _items = new ItemInfo[](len);

        for (uint256 i = 0; i < len;) {
            _items[i] =  items[i];
            unchecked {
                ++i;
            }
        }

        return _items;
    }
}