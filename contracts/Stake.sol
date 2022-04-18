// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FuseBlock.sol";

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
    uint256 rewardInterval = 1 days;

    constructor (address _fuseBlockAddress, address _auraAddress)  {
        fuseBlockAddress = _fuseBlockAddress;
        auraAddress = _auraAddress;
    }

    function stake(uint256 _tokenId) external {
        require(FuseBlock(fuseBlockAddress).ownerOf(_tokenId) == msg.sender, "not owner of token");
        FuseBlock(fuseBlockAddress).transferFrom(msg.sender, address(this), _tokenId);

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
        FuseBlock(fuseBlockAddress).transferFrom(address(this), msg.sender, _tokenId);
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
            auraAmount = FuseBlock(fuseBlockAddress).getAuraAmount(_tokenIds[i]);
            rewards += auraAmount * (block.timestamp - token.stakedAt) / rewardInterval;
        }

        return rewards;
    }

    function claimRewards() public {
        uint256 rewards = calculateRewards(msg.sender);

        IERC20(auraAddress).transfer(msg.sender, rewards);
    }
}