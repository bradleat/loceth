pragma solidity ^0.4.11;

contract Owned {
    address public owner;

    event OwnershipTransfered(address indexed from, address indexed to);
    function Owned(){
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function transferOwnership(address _to) onlyOwner returns (bool) {
        owner = _to;
        OwnershipTransfered(msg.sender, _to);
        return true;
    }
}