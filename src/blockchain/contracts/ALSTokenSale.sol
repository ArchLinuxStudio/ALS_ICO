// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import {ALSToken} from "./ALSToken.sol";

contract ALSTokenSale {
    // DO NOT expose the address of admin
    address admin;
    ALSToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(ALSToken _tokenContract, uint256 _tokenPrice) {
        // Assign an admin
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // mulitply
    //pure means not create transactions, not read or write data to blockchain
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        // ensuring that after multiplication, returned value is not getting overflowed.
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // msg.sender here is the buyer
        // in transfer function, msg.sender is ALSTokenSale contract
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending ALSToken sale
    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        // Transfer remaining tokens to admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

        // after transfer token, also transfer the balance to the admin
        payable(admin).transfer(address(this).balance);
        // use selfdestruct() if want to disable this contract
    }
}
