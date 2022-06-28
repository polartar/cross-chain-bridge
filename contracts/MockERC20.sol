// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MockERC20 is UUPSUpgradeable, ERC20Upgradeable, OwnableUpgradeable {
    address fuseBlockAddress;
    address itemAddress;
    address stakeAddress;

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        __ERC20_init("Aura Token", "AU");
        
        _mint(msg.sender, 100000000 * (10 ** 18));
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

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