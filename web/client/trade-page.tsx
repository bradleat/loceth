import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';


import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export interface IRouteParams {
    to: string;
}
export interface IToken {
    name: string;
    decimals: number;
    symbol: string;
    address: string;
    userBalance: BigNumber.BigNumber;
    allowance: BigNumber.BigNumber;
}

export interface ITradePageState {
    tokens: IToken[];
    escrowTokenAddress: string;
    escrowAmount: BigNumber.BigNumber;

}

export default class TradePage extends React.Component<RouteComponentProps<IRouteParams>, ITradePageState> {
    constructor() {
        super();
        this.state = {
            tokens: [],
            escrowTokenAddress: '',
            escrowAmount: window.web3.toBigNumber(0)
        };
        this.update();
    }
    private async update(){
        
        const foreignTokenAddress = await contracts.LOCToken.tokenList.call(0);
        const foreignToken = await contracts.ForeignERCTokenContract.at(foreignTokenAddress);
        const foreignTokenName = await foreignToken.name();
        let foreignTokenDecimals = await foreignToken.decimals();
        foreignTokenDecimals = foreignTokenDecimals.toNumber();
        const foreignTokenSymbol = await foreignToken.symbol();
        const foreignTokenUserBalance = await foreignToken.balanceOf(window.web3.eth.coinbase);
        const foreignTokenAllowance = await foreignToken.allowance(window.web3.eth.coinbase, contracts.Escrow.address);
        this.setState({
            tokens: [{
                name: foreignTokenName,
                decimals: foreignTokenDecimals,
                symbol: foreignTokenSymbol,
                address: foreignTokenAddress,
                userBalance: foreignTokenUserBalance,
                allowance: foreignTokenAllowance
            }]
        });
    }
    public render(){
        const currentToken = this.state.tokens.filter((token) => token.address === this.state.escrowTokenAddress)[0];
        const disableEscrowButton = currentToken ? 
            !(currentToken.allowance.greaterThanOrEqualTo(this.state.escrowAmount) && currentToken.userBalance.greaterThanOrEqualTo(this.state.escrowAmount)) : 
            true;
        return (
            <div className="trade-page">

                <h2>Start a New Trade</h2>
                Trade Token: <select value={this.state.escrowTokenAddress} onChange={(event) => {
                    const escrowTokenAddress = event.target.selectedOptions[0].value;
                    this.setState({escrowTokenAddress});
                }}>
                    <option key="" value=""></option>
                    {this.state.tokens.map((token) => <option key={token.address} value={token.address}>{token.symbol}</option>)}
                </select><br />
                Amount (in Wei): <input 
                    value={this.state.escrowAmount.toNumber()}
                    type="number"
                    onChange={(event) => {
                        if(Number(event.target.value) < 0){
                            return;
                        }
                        const escrowAmount = window.web3.toBigNumber(event.target.value);
                        this.setState({escrowAmount});
                    }}
                /><br />
                <br />
                Your Balance of Token: {currentToken ? currentToken.userBalance.toNumber() : "N/A"}<br />
                Allowance set for Escrow Contract: {currentToken ? currentToken.allowance.toNumber() : "N/A"}<br />
                Seller of Token: {window.web3.eth.coinbase}<br />
                Buyer of Token: {this.props.match.params.to}<br />

                <button disabled={currentToken ? false : true} onClick={async () => {
                    const foreignToken = await contracts.ForeignERCTokenContract.at(this.state.escrowTokenAddress);
                    await foreignToken.approve(
                        contracts.Escrow.address,
                        this.state.escrowAmount,
                        {from: window.web3.eth.coinbase}
                    );
                }}>Approve Allowance for Escrow</button><br/>
                <button disabled={disableEscrowButton} onClick={async () => {
                    // function escrow(address _seller, address _buyer, address _foreignToken, uint256 _amount)}
                    await contracts.Escrow.escrow(
                        window.web3.eth.coinbase,
                        this.props.match.params.to,
                        this.state.escrowTokenAddress,
                        this.state.escrowAmount,
                        {from: window.web3.eth.coinbase}
                    );
                }}>Enter Escrow</button><br/>
                
            </div>
        );
    }
}