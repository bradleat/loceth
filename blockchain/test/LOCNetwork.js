var LOCToken = artifacts.require("LOCToken");
var Escrow = artifacts.require("Escrow");
var TestToken = artifacts.require("TestToken");

contract('LOCNetwork', function(accounts) {
  it("should put web3.toWei(823543, 'ether') LOC in the deploying account", function() {
    return LOCToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), web3.toWei(823543, 'ether'), "web3.toWei(823543, 'ether') wasn't in the first account");
    });
  });
  it("should be able to transfer() LOC between two accounts", function () {
    var token;
    return LOCToken.deployed().then(function(instance) {
      token = instance;
      return token.transfer(accounts[1], web3.toWei(1, 'ether'));
    }).then(function(res) {
      assert.equal(res.logs[0].event, 'Transfer', "Event wasn't emitted as expected");
      assert.equal(res.logs[0].args.from, accounts[0], "'From' on the event wasn't emitted as expected");
      assert.equal(res.logs[0].args.to, accounts[1], "'To' on the event wasn't emitted as expected");
      assert.equal(res.logs[0].args.amount.toNumber(), web3.toWei(1, 'ether'), "The amount on the event wasn't emitted as expected");
      return token.balanceOf.call(accounts[0]);
    }).then(function (balance) {
      var expectedBalance = new web3.BigNumber(web3.toWei(823543, 'ether'));
      expectedBalance = expectedBalance.minus(web3.toWei(1, 'ether'));
      assert.equal(true, expectedBalance.equals(balance), "the first account didn't have the amount expected");
      return token.balanceOf.call(accounts[1]);
    }).then(function (balance) {
      var expectedBalance = new web3.BigNumber(web3.toWei(1, 'ether'));
      assert.equal(true, expectedBalance.equals(balance), "the second account didn't have the amount expected");
    });
  });

  it("should let the owner add a foreign token for recognition of the treasury", function () {
    var token;
    var foreignToken;
    return LOCToken.deployed().then(function(instance) {
      token = instance;
      return TestToken.deployed();
    }).then(function(foreignTokenInstance) {
      foreignToken = foreignTokenInstance;
      return token.addToken(foreignToken.address);
    }).then(function (res) {
      assert.equal(res.logs[0].event, 'TokenAdded', "Event wasn't emitted as expected");
      assert.equal(res.logs[0].args.token, foreignToken.address, "Event wasn't emitted as expected");
      return token.findToken.call(foreignToken.address);
    }).then(function (res) {
      assert.equal(res[0], true, "Token wasn't found by contract");
      assert.equal(res[1].toNumber(), 0, "Token wasn't found in index expected");
    });
  });

  it("should return foreign token to the user when burned", function () {
    var token;
    var foreignToken;
    return LOCToken.deployed().then(function(instance) {
      token = instance;
      return TestToken.deployed();
    }).then(function(foreignTokenInstance) {
      foreignToken = foreignTokenInstance;
      return foreignToken.transfer(token.address, web3.toWei(10, 'ether'));
    }).then(function (res) {
      return foreignToken.balanceOf(token.address);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), web3.toWei(10, 'ether'), "Transfer wasn't conducted as expected");
      return token.burn(web3.toWei(1, 'ether'));
    }).then(function (res) {

      assert.equal(res.logs[1].event, 'CashOut', 'second event is not as expected.');
      assert.equal(res.logs[1].args.token, foreignToken.address, 'second event is not as expected.');
      assert.equal(res.logs[1].args.to, accounts[0], 'second event is not as expected.');
      var cashedOutAmount = res.logs[1].args.amount.toNumber();
      var expectedAmount = web3.toWei(10, 'ether') * (web3.toWei(1, 'ether') / web3.toWei(823543, 'ether'));
      assert.equal(cashedOutAmount, parseInt(expectedAmount), 'second even is not as expected');
      
      assert.equal(res.logs[0].event, 'Transfer', 'first event is not as expected.');
      assert.equal(res.logs[0].args.from, token.address, 'first event is not as expected.');
      assert.equal(res.logs[0].args.to, accounts[0], 'first event is not as expected.');
      assert.equal(res.logs[0].args.amount.toNumber(), parseInt(expectedAmount), 'first event is not as expected.');

      assert.equal(res.logs[2].event, 'Burn', 'third event is not as expected.');
      assert.equal(res.logs[2].args.from, accounts[0], 'third event is not as expected.');
      assert.equal(res.logs[2].args.amount.toNumber(), web3.toWei(1, 'ether'), 'third event is not as expected.');
      return foreignToken.balanceOf(accounts[0]);
    }).then(function (res) {
      var profitsFromBurning = web3.toWei(10, 'ether') * (web3.toWei(1, 'ether') / web3.toWei(823543, 'ether'));
      var previousBalance = web3.toWei(100, 'ether') - web3.toWei(10, 'ether'); // 10 ether of FT was transfered to the token contract while 823543 ether was the init balance
      assert.equal(previousBalance + parseInt(profitsFromBurning), res.toNumber(), 'balance was unexpected');
    });
  });
});
