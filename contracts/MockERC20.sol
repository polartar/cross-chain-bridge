// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    address fuseBlockAddress;
    address itemAddress;
    address stakeAddress;

    constructor () ERC20 ("Test", "TT") {
        _mint(msg.sender, 100000000 * (10 ** 18));
    }

    function mint(uint256 _amount) public onlyOwner {
        _mint(msg.sender, _amount);
    }

    function setFuseBlockAddress(address _fuseBlockAddress) external onlyOwner {
        fuseBlockAddress = _fuseBlockAddress;
    }

    function setItemAddress(address _itemAddress) external onlyOwner {
        itemAddress = _itemAddress;
    }

    function setStakeAddress(address _stakeAddress) external onlyOwner {
        stakeAddress = _stakeAddress;
    }

    function _beforeTokenTransfer(address from, address to, uint256) internal override virtual {
        if (from != address(0)
            && from != fuseBlockAddress
            && from != itemAddress
            && to != fuseBlockAddress
            && to != itemAddress
            && from != owner()
            && from != stakeAddress
        ) {
            revert("can't transfer");
        }
    }
}