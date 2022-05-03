const ALSTokenIrl = artifacts.require("ALSTokenIrl");
const mlog = require("mocha-logger");
const common = require("../const.js");
// required by .to.be.bignumber
const { BN } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("ALSTokenIrl", (accounts) => {
  const _name = "ALS Token";
  const _symbol = "ALS";
  const _decimals = new BN(18);

  beforeEach(async () => {
    // compare with deployed(), new() create new instance each time
    this.token = await ALSTokenIrl.new(_name, _symbol);
  });

  describe("token attributes", async () => {
    it("has the correct name", async () => {
      const name = await this.token.name();
      expect(name).to.equal(_name);
      //   assert.equal(name, _name);
    });

    it("has the correct symbol", async () => {
      const symbol = await this.token.symbol();
      expect(symbol).to.equal(_symbol);
    });

    it("has the correct decimals", async () => {
      expect(await this.token.decimals()).to.be.bignumber.equal(_decimals);
    });
  });
});
