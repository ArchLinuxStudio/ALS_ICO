const ALSTokenIrl = artifacts.require("ALSTokenIrl");
const common = require("../const.js");

module.exports = async (deployer) => {
  await deployer.deploy(ALSTokenIrl, "ALS Token", "ALS");
};
