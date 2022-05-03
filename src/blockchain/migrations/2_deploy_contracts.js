const ALSToken = artifacts.require("ALSToken");
const ALSTokenSale = artifacts.require("ALSTokenSale");
const common = require("../const.js");

module.exports = async (deployer) => {
  await deployer.deploy(ALSToken, common.TOTAL_SUPPLY);
  await deployer.deploy(ALSTokenSale, ALSToken.address, common.ALS_TOKEN_PRICE);
};
