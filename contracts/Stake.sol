// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FuseBlock.sol";

interface IFuseBlock {
    function getAuraAmount(uint256 _tokenId) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function transferFrom(address from, address to, uint256 tokenId) external;
}
contract Stake is Ownable {
    struct TokenInfo {
        uint256 tokenId;
        address staker;
        uint256 stakedAt;
    }
    mapping(address => mapping(uint256 => TokenInfo)) users;
    mapping(address => uint256[]) tokenIds;
    address fuseBlockAddress;
    address auraAddress;
    uint256 rewardInterval = 1 hours;

    address royaltyReceiver;
    uint256 royaltyFraction;
    uint256 constant FEE_DENOMINATOR = 10000;

    constructor (address _fuseBlockAddress, address _auraAddress)  {
        fuseBlockAddress = _fuseBlockAddress;
        auraAddress = _auraAddress;
    }

    function updateRewardsInterval(uint256 _interval) external onlyOwner {
        rewardInterval = _interval;
    }

    function getStakedIds() external view returns(uint256[] memory) {
        return _getStakedIds(msg.sender);
    }

    function _getStakedIds(address _staker) private view returns(uint256[] memory) {
        return tokenIds[_staker];
    }

    function getAuraAmount() external view returns(uint256) {
        uint256[] memory stakedIds = _getStakedIds(msg.sender);
        uint256 totalAmount;
        uint256 len = stakedIds.length;

        for(uint256 i = 0; i < len; i ++) {
            totalAmount += IFuseBlock(fuseBlockAddress).getAuraAmount(stakedIds[i]);
        }

        return totalAmount;
    }

    function stake(uint256 _tokenId) external {
        require(IFuseBlock(fuseBlockAddress).ownerOf(_tokenId) == msg.sender, "not owner of token");
        IFuseBlock(fuseBlockAddress).transferFrom(msg.sender, address(this), _tokenId);

        TokenInfo memory token;
        token.tokenId = _tokenId;
        token.staker = msg.sender;
        token.stakedAt = block.timestamp;

        users[msg.sender][_tokenId] = token;
        tokenIds[msg.sender].push(_tokenId);
    }

    function unstake(uint256 _tokenId) external {
        uint256 tokenIndex = findTokenId(msg.sender, _tokenId);
        require(tokenIndex != type(uint256).max, "no exist");
        require(users[msg.sender][_tokenId].staker == msg.sender, "incorrect staker");
        IFuseBlock(fuseBlockAddress).transferFrom(address(this), msg.sender, _tokenId);
        delete users[msg.sender][_tokenId];

        tokenIds[msg.sender][tokenIndex] = tokenIds[msg.sender][tokenIds[msg.sender].length - 1];
        tokenIds[msg.sender].pop();
    }

    function findTokenId(address _staker, uint256 _tokenId) public view returns(uint256) {
        uint256[] memory _tokenIds = tokenIds[_staker];
        uint256 len = _tokenIds.length;
        require(len > 0, "no staked ids");

        for (uint256 i = 0; i < len; i ++) {
            if (_tokenIds[i] == _tokenId) {
                return i;
            }
        }
        return type(uint256).max;
    }

    function calculateRewards(address _staker) public view returns(uint256) {
        uint256[] memory _tokenIds = tokenIds[_staker];
        uint256 len = _tokenIds.length;
        TokenInfo memory token;
        uint256 auraAmount;
        uint256 rewards;
        
        for(uint256 i = 0; i < len; i ++) {
            token = users[msg.sender][_tokenIds[i]];
            auraAmount = IFuseBlock(fuseBlockAddress).getAuraAmount(_tokenIds[i]);
            rewards += auraAmount * ((block.timestamp - token.stakedAt) / rewardInterval);
        }

        return rewards;
    }

    function claimRewards() public {
        uint256 rewards = calculateRewards(msg.sender);
        require(IERC20(auraAddress).balanceOf(address(this)) >= rewards, "insufficient balance");

        uint256 royaltyFee;
        if (royaltyReceiver != address(0)) {
            royaltyFee = rewards * royaltyFraction / FEE_DENOMINATOR;
            IERC20(auraAddress).transfer(royaltyReceiver, royaltyFee);
            IERC20(auraAddress).transfer(msg.sender, rewards - royaltyFee);
        } else {
            IERC20(auraAddress).transfer(msg.sender, rewards);
        }
    }

    function setRoyalyInfo(address _receiver, uint256 _feeFraction) external onlyOwner {
        require(_feeFraction > 0 && _feeFraction < 10000, "invalid fee fraction");
        require(_receiver != address(0), "invalid address");
        royaltyReceiver = _receiver;
        royaltyFraction = _feeFraction;
    }

    function getRoyaltyInfo() external view returns(address, uint256) {
        return (royaltyReceiver, royaltyFraction);
    }
}