pragma solidity ^0.4.11;

import "./Pauseable.sol";

contract LOCProfile is Pauseable {

    event KeyUpdated(address indexed account);

    mapping (address => string) public publicKeys;

    function updateKey(string _key) notPaused returns (bool) {
        publicKeys[msg.sender] = _key;
        KeyUpdated(msg.sender);
        return true;
    }
}