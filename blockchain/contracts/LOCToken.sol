pragma solidity ^0.4.11;

import "./Owned.sol";
import "./Pauseable.sol";
import "./ForeignERCToken.sol";



contract LOCToken is Pauseable {
	string public name = 'LOC Token';
    uint8 public decimals = 18;
    string public symbol = 'LOC';
    string public version = 'H0.1';

	uint256 public totalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowances;

	address[] public tokenList;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

	event TokenAdded(address indexed token);
	event CashOut(address indexed token, address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);	


	function LOCToken(
        uint256 _totalSupply
    ){
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

	function transfer(address _to, uint256 _amount) notPaused returns (bool){
        if(balances[msg.sender] >= _amount && _amount > 0){
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(msg.sender, _to, _amount);
            return true;
        }
        return false;
    }

    function transferFrom(address _from, address _to, uint _amount) notPaused returns (bool) {
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

    function findToken(address _token) constant returns (bool, uint) {
        bool foundTokenInList = false;
        uint i;
        for (i = 0; i < tokenList.length; i++){
            if(tokenList[i] == _token){
                foundTokenInList = true;
                break;
            }
        }
        return (foundTokenInList, i);
    }
    function tokenCount() constant returns (uint){
        return tokenList.length;
    }
    function addToken(address _token) onlyOwner returns (bool) {
        bool foundToken;
        (foundToken,) = findToken(_token);
        if(!foundToken){
            tokenList.push(_token);
            TokenAdded(_token);
            return true;
        }
        return false;
    }
    function calculateBurn(uint _tokenIndex, uint256 _amount) constant returns (uint256) {
        address foreignToken = tokenList[_tokenIndex];
        ForeignERCToken foreignTokenContract = ForeignERCToken(foreignToken);
        uint256 foreignCoinBalance = foreignTokenContract.balanceOf(address(this));
        return foreignCoinBalance * _amount / totalSupply;
    }
    function burn(uint256 _amount) notPaused returns (bool){
        if(balances[msg.sender] >= _amount){
            balances[msg.sender] -= _amount;
            balances[0x0] += _amount;
            
            uint i;
            for (i = 0; i < tokenList.length; i++){
                address foreignToken = tokenList[i];
                ForeignERCToken foreignTokenContract = ForeignERCToken(foreignToken);
                uint256 foreignCoinBalance = foreignTokenContract.balanceOf(address(this));
				uint256 amountToTransfer = foreignCoinBalance * _amount / totalSupply;
                foreignTokenContract.transfer(msg.sender, amountToTransfer);
                CashOut(foreignToken, msg.sender, amountToTransfer);
            }
            Burn(msg.sender, _amount);            
            totalSupply -= _amount;
        }
        return false;
    }


    function () { // rejects tokens sent directly
        throw;
    }
}