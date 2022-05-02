const ALSToken = artifacts.require('ALSToken');
const mlog = require('mocha-logger');
const common = require('../const.js');

contract('ALSToken', (accounts) => {
  let ALSTokenInstance;

  it('initializes the contract with the correct values', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    assert.equal(
      await ALSTokenInstance.name(),
      'ALS Token',
      'has the correct name'
    );
    assert.equal(
      await ALSTokenInstance.symbol(),
      'ALS',
      'has the correct symbol'
    );
    assert.equal(
      await ALSTokenInstance.standard(),
      'ALS Token v1.0',
      'has the correct standard'
    );
  });

  it('allocates the initial supply upon deployment', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    let totalSupply = await ALSTokenInstance.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      common.TOTAL_SUPPLY,
      'sets the total supply to' + common.TOTAL_SUPPLY
    );

    let adminBalance = await ALSTokenInstance.balanceOf(accounts[0]);
    assert.equal(
      adminBalance.toNumber(),
      common.TOTAL_SUPPLY,
      'it allocates the initial supply to the admin account'
    );
  });

  it('transfer token ownership', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    try {
      //.call() just inspect, but not create any transactions
      await ALSTokenInstance.transfer.call(accounts[1], 9999999999999);
      assert(false);
    } catch (error) {
      mlog.log('\n' + error.message);
      assert(
        error.message.indexOf('revert') >= 0,
        'error message must contain revert'
      );
    }
    ///
    const DEDUCTS_AMOUNT = 250000;

    let returnValue = await ALSTokenInstance.transfer.call(
      accounts[1],
      DEDUCTS_AMOUNT,
      //from specify the msg.sender
      {
        from: accounts[0],
      }
    );

    assert.equal(returnValue, true, 'it returns true');

    let receipt = await ALSTokenInstance.transfer(accounts[1], DEDUCTS_AMOUNT, {
      from: accounts[0],
    });

    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be transfer event');
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      'logs the account the tokens are transferred from'
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      'logs the account the tokens are transferred to'
    );
    assert.equal(
      receipt.logs[0].args._value,
      DEDUCTS_AMOUNT,
      'logs the transfer amount'
    );

    let balance1AfterTransfer = await ALSTokenInstance.balanceOf(accounts[1]);
    assert.equal(
      balance1AfterTransfer.toNumber(),
      DEDUCTS_AMOUNT,
      'adds the amount to the receiving account'
    );
    let balance0AfterTransfer = await ALSTokenInstance.balanceOf(accounts[0]);
    assert.equal(
      balance0AfterTransfer.toNumber(),
      common.TOTAL_SUPPLY - DEDUCTS_AMOUNT,
      'deducts the amount from the sending account'
    );
  });

  it('approves tokens for delegate transfer', async () => {
    const APPROVE_AMOUNT = 100;

    ALSTokenInstance = await ALSToken.deployed();
    // call doesn't create a transaction
    let result = await ALSTokenInstance.approve.call(
      accounts[1],
      APPROVE_AMOUNT
    );
    assert.equal(result, true, 'it returns true');

    let receipt = await ALSTokenInstance.approve(accounts[1], APPROVE_AMOUNT, {
      from: accounts[0],
    });
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Approval', 'should be Approval event');
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      'logs the account the tokens are authorized by'
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      'logs the account the tokens are authorized to'
    );
    assert.equal(
      receipt.logs[0].args._value,
      APPROVE_AMOUNT,
      'logs the transfer amount'
    );

    let allowance = await ALSTokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(
      allowance.toNumber(),
      APPROVE_AMOUNT,
      'stores the allowance for delegate transfer'
    );
  });

  it('handles delegated token transfers', async () => {
    ALSTokenInstance = await ALSToken.deployed();
    let fromAccount = accounts[2];
    let toAccount = accounts[3];
    let spendingAccount = accounts[4];

    const INIT_TOKEN_AMOUNT = 100;
    const APPROVE_TOKEN_AMOUNT = 10;

    // Transfer some tokens to fromAccount
    await ALSTokenInstance.transfer(fromAccount, INIT_TOKEN_AMOUNT, {
      from: accounts[0],
    });
    // Approve spendingAccount to spend 10 tokens from fromAccount
    await ALSTokenInstance.approve(spendingAccount, APPROVE_TOKEN_AMOUNT, {
      from: fromAccount,
    });

    // Try transferring something larger than the sender's balance
    try {
      await ALSTokenInstance.transferFrom(fromAccount, toAccount, 9999, {
        from: spendingAccount,
      });
      assert(false);
    } catch (error) {
      mlog.log('********error messages: \n' + error.message);
      assert(
        error.message.indexOf('revert') >= 0,
        'cannot transfer value larger than balance'
      );
    }

    // Try transferring something larger than the approved amount
    try {
      await ALSTokenInstance.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAccount,
      });
      assert(false);
    } catch (error) {
      mlog.log('********error messages: \n' + error.message);
      assert(
        error.message.indexOf('revert') >= 0,
        'cannot transfer value larger than approved amount'
      );
    }

    let result = await ALSTokenInstance.transferFrom.call(
      fromAccount,
      toAccount,
      APPROVE_TOKEN_AMOUNT,
      {
        from: spendingAccount,
      }
    );
    assert.equal(result, true);

    let receipt = await ALSTokenInstance.transferFrom(
      fromAccount,
      toAccount,
      APPROVE_TOKEN_AMOUNT,
      {
        from: spendingAccount,
      }
    );
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      'logs the account the tokens are transferred from'
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      'logs the account the tokens are transferred to'
    );
    assert.equal(
      receipt.logs[0].args._value,
      APPROVE_TOKEN_AMOUNT,
      'logs the transfer amount'
    );

    let fromAccountBalance = await ALSTokenInstance.balanceOf(fromAccount);
    assert.equal(
      fromAccountBalance.toNumber(),
      90,
      'deducts the amount from the sending account'
    );
    let toAccountBalance = await ALSTokenInstance.balanceOf(toAccount);
    assert.equal(
      toAccountBalance.toNumber(),
      APPROVE_TOKEN_AMOUNT,
      'add the amount from the receiving account'
    );

    let allowance = await ALSTokenInstance.allowance(
      fromAccount,
      spendingAccount
    );
    assert.equal(
      allowance.toNumber(),
      0,
      'deducts the amount from the allowacne'
    );
  });
});
