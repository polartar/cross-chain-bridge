//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface ITokenForBridge {
    function mint(address _account, uint256 _amount) external;

    function burn(address _account, uint256 _amount) external;
}
