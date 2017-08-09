pragma solidity ^0.4.11;

import "./Owned.sol";
import "./Pauseable.sol";
import "./ForeignERCToken.sol";
import "./LOCToken.sol";

contract AdminControlled is Owned {
    address[] public admins;
    event AdminHired(address indexed admin);
    event AdminFired(address indexed admin);
    function hireAdmin(address _admin) onlyOwner returns (bool) {
        admins.push(_admin);
        AdminHired(_admin);
        return true;
    }
    function adminsLength() constant returns (uint) {
        return admins.length;
    }
    function fireAdmin(address _admin) onlyOwner returns (bool) {
        for (uint i = 0; i < admins.length; i++){
            if(admins[i] == _admin){
                if(admins.length > 1){
                    admins[i] = admins[admins.length - 1];
                }
                delete admins[admins.length - 1];
                AdminFired(_admin);
                return true;
            }
        }
        return false;
    }
    function isAdmin(address _admin) constant returns (bool) {
        for (uint i = 0; i < admins.length; i++){
            if(admins[i] == _admin){
                return true;
            }
        }
        return false;
    }
    modifier onlyAdmins() {
        require(isAdmin(msg.sender));
        _;
    }
}

contract Escrow is AdminControlled, Pauseable {
    // Ecrow is between two parties
    // add some id or something for the escrow
    LOCToken public tokenTreasury;
    function Escrow (address _tokenTreasuryAddress){
        tokenTreasury = LOCToken(_tokenTreasuryAddress);
    }
    enum EscrowState {finished, held, disputed, availableForBuyer, availableForSeller}
    struct EscrowAgreement {
        EscrowState state;
        address seller;
        address buyer;
        address foreignToken;
        uint256 heldAmount;
    }
    EscrowAgreement[] public escrowAgreements;

    function escrowAgreementsLength() constant returns (uint) {
        return escrowAgreements.length;
    }

    event EnteredEscrow(address indexed seller, address indexed buyer, address indexed token, uint256 amount, uint agreementIndex);

    event DisputedEscrow(address indexed buyer, address indexed seller, address indexed token, uint256 amount, uint agreementIndex);

    event ResolvedEscrowDispute(address indexed inFavorOf, address indexed otherParty, address indexed token, uint256 amount, uint agreementIndex);

    event AvailableFunds(address indexed availableFor, address indexed otherParty, address indexed token, uint256 amount, uint agreementIndex);

    event TaxPaid(address indexed payee, address indexed foreignToken, uint256 amount);

    // add function to check escrow perhaps calculate tax as well and do it first?

    function escrow(address _seller, address _buyer, address _foreignToken, uint256 _amount) notPaused returns (bool) {
        require(_seller == msg.sender);
        if(_foreignToken != address(tokenTreasury)){ // if we aren't using LOC
            bool foundToken;
            (foundToken,) = tokenTreasury.findToken(_foreignToken);
            if(!foundToken){
                return false;
            }
        }
        
        ForeignERCToken foreignTokenContract = ForeignERCToken(_foreignToken);
        bool success = foreignTokenContract.transferFrom(_seller, address(this), _amount);
        if(success == false){
            return false;
        }
        
        uint i;
        bool noneFinished = true;
        for (i = 0; i < escrowAgreements.length; i++){
            if(escrowAgreements[i].state == EscrowState.finished){
                noneFinished = false;
                break;
            }
        }
        EscrowAgreement memory agreement = EscrowAgreement({state: EscrowState.held, seller: _seller, buyer: _buyer, heldAmount: _amount, foreignToken: _foreignToken});
        if(noneFinished){
            escrowAgreements.push(agreement);
            EnteredEscrow(_seller, _buyer, _foreignToken, _amount, escrowAgreements.length - 1);
        }
        else {
            escrowAgreements[i] = agreement;
            EnteredEscrow(_seller, _buyer, _foreignToken, _amount, i);
        }
        return true;
    }
    function calculateAndPayTax(uint _agreementIndex) internal returns (bool){
        EscrowAgreement agreement = escrowAgreements[_agreementIndex];
        if(agreement.foreignToken != address(tokenTreasury)){
            uint percentage = 5; // 5 percent tax
            uint256 amountToTax = (agreement.heldAmount * percentage) / 100;
            agreement.heldAmount -= amountToTax; // is this working?
            ForeignERCToken foreignTokenContract = ForeignERCToken(agreement.foreignToken);
            foreignTokenContract.transfer(address(tokenTreasury), amountToTax - 1);
            TaxPaid(msg.sender, agreement.foreignToken, amountToTax - 1);
            // no tax paid on LOC
            // transfer some tokens to this address

            // tokenTreasury.payTax(agreement.foreignToken, agreement.buyer, amountToTax);
            return true;
        }
        return false;
    }
    function allowPayOut(uint _agreementIndex) returns (bool) {
        EscrowAgreement agreement = escrowAgreements[_agreementIndex];
        require(agreement.seller == msg.sender);
        agreement.state = EscrowState.availableForBuyer;
        calculateAndPayTax(_agreementIndex);
        approveFunds(_agreementIndex);
        AvailableFunds(agreement.buyer, agreement.seller, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
        return true;
    }
    function triggerDispute(uint _agreementIndex) returns (bool) {
        EscrowAgreement agreement = escrowAgreements[_agreementIndex];
        require(agreement.buyer == msg.sender || agreement.seller == msg.sender);
        agreement.state = EscrowState.disputed;
        DisputedEscrow(agreement.buyer, agreement.seller, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
        return true;
    }
    function resolveDispute(uint _agreementIndex, bool _inFavorOfBuyer) onlyAdmins returns (bool){
        EscrowAgreement agreement = escrowAgreements[_agreementIndex];
        require(agreement.state == EscrowState.disputed);
        if(_inFavorOfBuyer){
            agreement.state = EscrowState.availableForBuyer;
            calculateAndPayTax(_agreementIndex);
            ResolvedEscrowDispute(agreement.buyer, agreement.seller, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
            approveFunds(_agreementIndex);
            AvailableFunds(agreement.buyer, agreement.seller, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
        }
        else {
            agreement.state = EscrowState.availableForSeller;
            ResolvedEscrowDispute(agreement.seller, agreement.buyer, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
            approveFunds(_agreementIndex);
            AvailableFunds(agreement.seller, agreement.buyer, agreement.foreignToken, agreement.heldAmount, _agreementIndex);
            
        }
        return _inFavorOfBuyer;
    }
    function approveFunds(uint _agreementIndex) internal returns (bool) {
        EscrowAgreement agreement = escrowAgreements[_agreementIndex];
        require(agreement.state == EscrowState.availableForBuyer || agreement.state == EscrowState.availableForSeller);
        uint256 existingApproval;
        if(agreement.state == EscrowState.availableForBuyer){
            // require(agreement.buyer == msg.sender);
            ForeignERCToken foreignTokenContract = ForeignERCToken(agreement.foreignToken);
            existingApproval = foreignTokenContract.allowance(address(this), agreement.buyer);
            foreignTokenContract.approve(agreement.buyer, agreement.heldAmount + existingApproval);
            agreement.state = EscrowState.finished;
        }
        else {
            // require(agreement.seller == msg.sender);
            existingApproval = foreignTokenContract.allowance(address(this), agreement.seller);
            foreignTokenContract.approve(agreement.seller, agreement.heldAmount + existingApproval);
            agreement.state = EscrowState.finished;
        }
    }

}

