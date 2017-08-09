pragma solidity ^0.4.11;

import "./Owned.sol";

contract Pauseable is Owned {
    bool public paused;    
    function togglePaused() onlyOwner returns (bool) {
        if(paused == true){
            paused = false;
        }
        else {
            paused = true;
        }
        return paused;
    }

    modifier notPaused() {
        require(paused == false);
        _;
    }
}