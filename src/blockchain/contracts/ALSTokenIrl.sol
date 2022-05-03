// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

contract ALSTokenIrl is ERC20Pausable {
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {}
}
