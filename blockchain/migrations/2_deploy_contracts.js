var LOCToken = artifacts.require("LOCToken");
var LOCProfile = artifacts.require("LOCProfile");
var Escrow = artifacts.require("Escrow");
var TestToken = artifacts.require("TestToken");

module.exports = function(deployer) {
  deployer.deploy(TestToken, web3.toWei(100, 'ether')).then(() => {
    return deployer.deploy(LOCToken, web3.toWei(823543, 'ether')).then(() => {
      return LOCToken.deployed();
    }).then((LOCTokenInstance) => {
      return LOCTokenInstance.addToken(TestToken.address, {from: web3.eth.coinbase});
    }).then(() => {
      return deployer.deploy(Escrow, LOCToken.address).then(() => {
        return Escrow.deployed();
      }).then((EscrowInstance) => {
        return EscrowInstance.hireAdmin(web3.eth.coinbase, {from: web3.eth.coinbase});
      });
    });
  });
  deployer.deploy(LOCProfile);
};
