const ALSTokenIrl = artifacts.require("ALSTokenIrl");
const ALSTokenSaleIrl = artifacts.require("ALSTokenSaleIrl");
const mlog = require("mocha-logger");
const common = require("../const.js");
// required by .to.be.bignumber
const { BN } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("ALSTokenSaleIrl", ([_, wallet]) => {
  const _name = "ALS Token";
  const _symbol = "ALS";
  const _decimals = new BN(18);

  const _rate = new BN(500);
  const _wallet = wallet;

  beforeEach(async () => {
    this.token = await ALSTokenIrl.new(_name, _symbol);

    this.crowdsale = await ALSTokenSaleIrl.new(
      _rate,
      _wallet,
      this.token.address
    );
  });

  describe("crowdsale", async () => {
    it("tracks the rate", async () => {
      const rate = await this.crowdsale.rate();

      expect(rate).to.be.bignumber.equal(_rate);
    });

    it("tracks the wallet", async () => {
      const wallet = await this.crowdsale.wallet();

      expect(wallet).to.equal(_wallet);
    });

    it("tracks the token", async () => {
      const token = await this.crowdsale.token();

      expect(token).to.equal(this.token.address);
    });
  });
});
