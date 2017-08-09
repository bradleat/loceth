pragma solidity ^0.4.11;

contract TestToken {
    string public name = 'Test Token';
    uint8 public decimals = 18;
    string public symbol = 'TST';
    string public version = 'H0.1';

	uint256 public totalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowances;


    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);


	function TestToken(
        uint256 _totalSupply
    ){
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

	function transfer(address _to, uint256 _amount) returns (bool){
        if(balances[msg.sender] >= _amount && _amount > 0){
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(msg.sender, _to, _amount);
            return true;
        }
        return false;
    }

    function transferFrom(address _from, address _to, uint _amount) returns (bool) {
        if(balances[_from] >= _amount && allowances[_from][msg.sender] >= _amount && _amount > 0){
            balances[_from] -= _amount;
            allowances[_from][msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(_from, _to, _amount);
            return true;
        }
        return false;
    }

    function balanceOf(address _account) constant public returns (uint256) {
        return balances[_account];
    }

    function approve(address _for, uint _amount) returns (bool) {
        allowances[msg.sender][_for] = _amount;
        Approval(msg.sender, _for, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256){
        return allowances[_owner][_spender];
    }
}