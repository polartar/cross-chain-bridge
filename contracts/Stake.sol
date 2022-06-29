// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";


interface IFuseBlock {
    function getAuraAmount(uint256 _tokenId) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getRequirementStatus(uint256 _tokenId) external view returns(bool);
}

interface IItem {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function getAuraAmount(uint256 _tokenId) external view returns (uint256);
    function getFuseBlockIdFromItemId(uint256 _itemId) external view returns(uint256);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external;
}
contract Stake is UUPSUpgradeable, OwnableUpgradeable, IERC1155ReceiverUpgradeable {
    event StakeNFT(address indexed staker, address indexed tokenAddress, uint256 tokenId, uint256 amount);
    event UnStakeNFT(address indexed staker, address indexed tokenAddress, uint256 tokenId, uint256 amount);
    struct TokenInfo {
        uint256 tokenId;
        address tokenAddress;
        address staker;
        uint256 amount;
        uint256 stakedAt;
    }
    // mapping(address => mapping(uint256 => TokenInfo)) users;
    mapping(address => TokenInfo[]) stakes;

    // tokenAddress => id => index of stakes
    mapping(address => mapping(uint256 => uint256)) stakeIndexes;

    // user => tokenAddress => ids
    mapping(address => mapping(address => uint256[])) tokenIds;

    address public fuseBlockAddress;
    address public itemAddress;
    address public auraAddress;
    uint256 rewardInterval;

    address royaltyReceiver;
    uint256 royaltyFraction;
    uint256 constant FEE_DENOMINATOR = 10000;

    function initialize(address _fuseBlockAddress, address _itemAddress, address _auraAddress) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        fuseBlockAddress = _fuseBlockAddress;
        itemAddress = _itemAddress;
        auraAddress = _auraAddress;
        rewardInterval = 1 hours;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    modifier onlySupportToken(address _tokenAddress) {
        require(_tokenAddress == fuseBlockAddress || _tokenAddress == itemAddress, "invalid token");
        _;
    }

    function updateRewardsInterval(uint256 _interval) external onlyOwner {
        rewardInterval = _interval;
    }

    function getStakedIds(address _tokenAddress) external view returns(uint256[] memory) {
        return tokenIds[msg.sender][_tokenAddress];
    }

    // function _getStakedIds(address _staker) private view returns(uint256[] memory) {
    //     return tokenIds[_staker];
    // }

    function getAuraAmount() external view returns(uint256) {
        TokenInfo[] memory tokens = stakes[msg.sender];
        uint256 totalAmount;
        uint256 len = tokens.length;

        for(uint256 i = 0; i < len; i ++) {
            if (fuseBlockAddress == tokens[i].tokenAddress) {
                totalAmount += IFuseBlock(fuseBlockAddress).getAuraAmount(tokens[i].tokenId);
            } else {
                totalAmount += IItem(itemAddress).getAuraAmount(tokens[i].tokenId);
            }
            
        }

        return totalAmount;
    }

    function stake(address _tokenAddress, uint256 _tokenId, uint256 _amount) external onlySupportToken(_tokenAddress) {
        require(_amount > 0, "invalid amount");
        if (_tokenAddress == fuseBlockAddress) {
            require(IFuseBlock(fuseBlockAddress).ownerOf(_tokenId) == msg.sender, "not owner of token");
            require(_amount == 1, "invalid amount");
            IFuseBlock(fuseBlockAddress).transferFrom(msg.sender, address(this), _tokenId);
        } else {
            require(IItem(itemAddress).balanceOf(msg.sender, _tokenId) >= _amount, "insufficient balance");
            IItem(itemAddress).safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");
        }
        
        TokenInfo memory token;
        token.tokenId = _tokenId;
        token.tokenAddress = _tokenAddress;
        token.staker = msg.sender;
        token.amount = _amount;
        token.stakedAt = block.timestamp;
        
        stakeIndexes[_tokenAddress][_tokenId] = stakes[msg.sender].length + 1;
        stakes[msg.sender].push(token);

        tokenIds[msg.sender][_tokenAddress].push(_tokenId);

        emit StakeNFT(msg.sender, _tokenAddress, _tokenId, _amount);
    }

    function unstake(address _tokenAddress, uint256 _tokenId, uint256 _amount) external onlySupportToken(_tokenAddress) {
        require(_amount > 0, "invalid amount");
        uint256 stakeIndex = stakeIndexes[_tokenAddress][_tokenId];
        require(stakeIndex > 0, "no staked tokenId");

        TokenInfo memory token = stakes[msg.sender][stakeIndex - 1];
        require(token.staker == msg.sender, "incorrect staker");

        if (_tokenAddress == fuseBlockAddress) {
            require(_amount == 1, "invalid amount");
            IFuseBlock(fuseBlockAddress).transferFrom(address(this), msg.sender, _tokenId);
        } else {
            require(token.amount >= _amount, "insufficient balance");
            IItem(itemAddress).safeTransferFrom(address(this), msg.sender, _tokenId, _amount, "");
        }

        if (token.amount == _amount) {
            delete stakes[msg.sender][stakeIndex - 1];
            stakeIndexes[_tokenAddress][_tokenId] = 0;
            uint256 tokenIndex = findTokenId(msg.sender, _tokenAddress, _tokenId);

            require(tokenIndex != type(uint256).max, "no exist");

            tokenIds[msg.sender][_tokenAddress][tokenIndex] = tokenIds[msg.sender][_tokenAddress][tokenIds[msg.sender][_tokenAddress].length - 1];
            tokenIds[msg.sender][_tokenAddress].pop();
        } else {
            stakes[msg.sender][stakeIndex - 1].amount = token.amount - _amount;
        }

        emit UnStakeNFT(msg.sender, _tokenAddress, _tokenId, _amount);
    }

    function findTokenId(address _staker, address _tokenAddress ,uint256 _tokenId) public view returns(uint256) {
        uint256[] memory _tokenIds = tokenIds[_staker][_tokenAddress];
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
        TokenInfo[] memory tokens = stakes[_staker];
        uint256 len = tokens.length;
       
        uint256 auraAmount;
        uint256 rewards;
        
        for(uint256 i = 0; i < len; i ++) {
            if (tokens[i].tokenAddress == fuseBlockAddress) {
                auraAmount = IFuseBlock(fuseBlockAddress).getAuraAmount(tokens[i].tokenId);
            } else {
                auraAmount = IItem(itemAddress).getAuraAmount(tokens[i].tokenId) * tokens[i].amount;
            }

            rewards += auraAmount * ((block.timestamp - tokens[i].stakedAt) / rewardInterval);
        }

        return rewards;
    }

    function claimRewards() public {
        uint256 rewards = calculateRewards(msg.sender);
        require(IERC20Upgradeable(auraAddress).balanceOf(address(this)) >= rewards, "insufficient balance");

        uint256 royaltyFee;
        if (royaltyReceiver != address(0)) {
            royaltyFee = rewards * royaltyFraction / FEE_DENOMINATOR;
            IERC20Upgradeable(auraAddress).transfer(royaltyReceiver, royaltyFee);
            IERC20Upgradeable(auraAddress).transfer(msg.sender, rewards - royaltyFee);
        } else {
            IERC20Upgradeable(auraAddress).transfer(msg.sender, rewards);
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

    function updateAuraAddress(address _newAddress) external onlyOwner {
        auraAddress = _newAddress;
    }

    function updateFuseBlockAddress(address _newAddress) external onlyOwner {
        fuseBlockAddress = _newAddress;
    }

    function updateItemAddress(address _newAddress) external onlyOwner {
        itemAddress = _newAddress;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external virtual override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155Received.selector;
    }
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external virtual override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external virtual override view returns (bool){
        return interfaceId == type(IERC165Upgradeable).interfaceId;
    }
}