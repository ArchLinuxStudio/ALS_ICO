const ALSTokenSale = artifacts.require('ALSTokenSale');
const ALSToken = artifacts.require('ALSToken');
const mlog = require('mocha-logger');
const common = require('../const.js');

contract('ALSTokenSale', (accounts) => {
  let ALSTokenSaleInstance;
  let ALSTokenInstance;
  let admin = accounts[0];
  let buyer = accounts[1];

  it('initializes the contract with the correct values', async () => {
    ALSTokenSaleInstance = await ALSTokenSale.deployed();

    let address = ALSTokenSaleInstance.address;
    assert.notEqual(address, 0x0, 'has contract address');

    let tokenContractaddress = await ALSTokenSaleInstance.tokenContract();
    assert.notEqual(tokenContractaddress, 0x0, 'has token contract address');

    let price = await ALSTokenSaleInstance.tokenPrice();
    assert.equal(price, common.ALS_TOKEN_PRICE, 'token price is correct');
  });

  it('facilitates token buying', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    ALSTokenSaleInstance = await ALSTokenSale.deployed();
    // give ALS_ICO_SUPPLY_PERCENT token to sale contract
    await ALSTokenInstance.transfer(
      ALSTokenSaleInstance.address,
      common.TOTAL_SUPPLY * common.ALS_ICO_SUPPLY_PERCENT,
      { from: admin }
    );

    let numberOfTokens = 10;

    let receipt = await ALSTokenSaleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * common.ALS_TOKEN_PRICE,
    });

    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Sell', 'should be Sell event');
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      'logs the account that purchased the tokens'
    );
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      'logs the number of tokens purchased'
    );

    let amount = await ALSTokenSaleInstance.tokensSold();

    assert.equal(
      amount.toNumber(),
      numberOfTokens,
      'increments the number of tokens sold'
    );

    let buyerBalance = await ALSTokenInstance.balanceOf(buyer);
    let ALSTokenSaleBalance = await ALSTokenInstance.balanceOf(
      ALSTokenSaleInstance.address
    );
    assert.equal(buyerBalance.toNumber(), numberOfTokens);
    assert.equal(
      ALSTokenSaleBalance.toNumber(),
      common.TOTAL_SUPPLY * common.ALS_ICO_SUPPLY_PERCENT - numberOfTokens
    );

    //try to buy tokens different from the ether value
    try {
      await ALSTokenSaleInstance.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      });
      assert(false);
    } catch (error) {
      mlog.log('********error messages: \n' + error.message);
      assert(
        error.message.indexOf('revert') >= 0,
        'msg.value must equal number of tokens in wei'
      );
    }

    //try to buy tokens 1 more than the sale contrace have
    try {
      await ALSTokenSaleInstance.buyTokens(
        common.TOTAL_SUPPLY * common.ALS_ICO_SUPPLY_PERCENT + 1,
        {
          from: buyer,
          value: 1,
        }
      );
      assert(false);
    } catch (error) {
      mlog.log('********error messages: \n' + error.message);
      assert(
        error.message.indexOf('revert') >= 0,
        'cannot purchase more tokens than available'
      );
    }
  });

  it('ends token sale', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    ALSTokenSaleInstance = await ALSTokenSale.deployed();
    let numberOfTokens = 10;
    // Try to end sale from account other than admin
    try {
      await ALSTokenSaleInstance.endSale({ from: buyer });
      assert(false);
    } catch (error) {
      mlog.log('********error messages: \n' + error.message);
      assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
    }

    let receipt = await ALSTokenSaleInstance.endSale({ from: admin });
    let balanceOfAdmin = await ALSTokenInstance.balanceOf(admin);
    assert.equal(
      balanceOfAdmin.toNumber(),
      common.TOTAL_SUPPLY - numberOfTokens,
      'returns all unsold tokens to admin'
    );

    // Check that the contract has no balance
    let balance = await web3.eth.getBalance(ALSTokenSaleInstance.address);
    assert.equal(balance, 0);
  });
});
