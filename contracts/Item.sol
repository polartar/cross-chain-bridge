// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Item is ERC1155, Ownable{
    address public auraAddress;
    address public fuseBlockAddress;
    mapping(uint256 => string) tokenURIs;
    mapping(uint256 => uint256) auraAmounts;

    string DEFAULT_URI= "https://ipfs.io/ipfs/bafybeieg7xjxuzpc7vdie6mjefpoz5kd5sjipieextxqpgnsjglhjvwvpy/1.json";


    constructor (address _auraAddress, address _fuseBlockAddress) ERC1155 ("") {
        auraAddress = _auraAddress;
        fuseBlockAddress = _fuseBlockAddress;
    }

    modifier onlyFuseBlock() {
        require(msg.sender == fuseBlockAddress);
        _;
    }

    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        if (bytes(tokenURIs[_tokenId]).length != 0) {
            return tokenURIs[_tokenId];
        } else {
            return DEFAULT_URI;
        }
    }

    function setURI(uint256 _tokenId, string memory _uri) public onlyOwner {
        tokenURIs[_tokenId] = _uri;
    }

    function mint(address _address, uint256 _tokenId, uint256 _quantity, uint256 _auraAmount) public onlyFuseBlock{
        require(_quantity > 0, "invalid quantity");
        _mint(_address, _tokenId, _quantity, "");
         auraAmounts[_tokenId] = _auraAmount;
    }

    function updateAuraAddress(address _newAuraAddress) external onlyOwner {
        auraAddress = _newAuraAddress;
    }

    function updateFuseBlockAddress(address _newFuseBlockAddress) external onlyOwner {
        fuseBlockAddress = _newFuseBlockAddress;
    }


    function getAuraAmount(uint256 _tokenId) public view returns (uint256) {
        return auraAmounts[_tokenId];
    }
    
    // function updateTokenURI(uint _tokenId, string memory _tokenURI) external {
    //     require(ownerOf(_tokenId) == msg.sender, "not token owner");
    //     tokenURIs[_tokenId] = _tokenURI;
    // }
}