pragma solidity ^0.4.11;

contract ForeignERCToken {
    string public name;
    uint8 public decimals;
    string public symbol;
    string public version;
    function transferFrom(address _from, address _to, uint _amount) returns (bool);
    function balanceOf(address _account) constant public returns(uint);
    function transfer(address _to, uint256 _amount) returns (bool);
    function approve(address _for, uint _amount) returns (bool);
    function allowance(address _owner, address _spender) constant returns (uint256);
}