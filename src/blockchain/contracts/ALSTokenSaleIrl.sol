// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "./Crowdsale.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ALSTokenSaleIrl is Crowdsale {
    constructor(
        uint256 rate,
        address payable wallet,
        IERC20 token
    ) Crowdsale(rate, wallet, token) {}
}
