/// <reference path="../node_modules/web3-typescript-typings/index.d.ts" />
import * as Web3 from 'web3';
import * as contract from 'truffle-contract';
const {LOCToken, LOCProfile, Escrow, ForeignERCToken} = require('loceth-blockchain');

export interface IWeb3Window extends Window {
    web3: Web3
}
declare const window: IWeb3Window;
let contracts: {LOCProfile: any, Escrow: any, LOCToken: any, ForeignERCTokenContract: any};

export async function getContracts(){
    if(contracts){
        return {
            contracts
        };
    }
    else {
        const LOCProfileContract = contract(LOCProfile);
        LOCProfileContract.setProvider(window.web3.currentProvider);
        const LOCProfileAddress = LOCProfile.networks[Object.keys(LOCProfile.networks)[0]].address;
        const LOCProfileOnChain = await LOCProfileContract.at(LOCProfileAddress);

        const EscrowContract = contract(Escrow);
        EscrowContract.setProvider(window.web3.currentProvider);
        const EscrowAddress = Escrow.networks[Object.keys(Escrow.networks)[0]].address;
        const EscrowOnChain = await EscrowContract.at(EscrowAddress);

        const LOCTokenContract = contract(LOCToken);
        LOCTokenContract.setProvider(window.web3.currentProvider);
        const LOCTokenAddress = LOCToken.networks[Object.keys(LOCToken.networks)[0]].address;
        const LOCTokenOnChain = await LOCTokenContract.at(LOCTokenAddress);

        const ForeignERCTokenContract = contract(ForeignERCToken);
        ForeignERCTokenContract.setProvider(window.web3.currentProvider);


        contracts = {
            LOCProfile: LOCProfileOnChain,
            Escrow: EscrowOnChain,
            LOCToken: LOCTokenOnChain,
            ForeignERCTokenContract
        };

        return contracts;
    }
}

export {contracts};
