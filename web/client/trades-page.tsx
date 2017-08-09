import * as React from 'react';
import {Route, RouteComponentProps} from 'react-router-dom';
import TradePage, {IToken} from './trade-page';


import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export enum EscrowState {
    finished,
    held,
    disputed
};
export interface EscrowAgreement {
    state: EscrowState,
    seller: string;
    buyer: string;
    foreignToken: string;
    heldAmount: BigNumber.BigNumber;
    index: number;
}
export interface ITradesPageState {
    escrowAgreements: EscrowAgreement[];
    isAdmin: boolean;
    tokens: IToken[];
    escrowTokenAddress: string;
    escrowAmount: BigNumber.BigNumber;
}
export default class TradesPage extends React.Component<RouteComponentProps<any>, ITradesPageState> {
    constructor() {
        super();
        this.state = {
            escrowAgreements: [],
            isAdmin: false,
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
        const foreignTokenUserBalance = await foreignToken.allowance(contracts.Escrow.address, window.web3.eth.coinbase);
        this.setState({
            tokens: [{
                name: foreignTokenName,
                decimals: foreignTokenDecimals,
                symbol: foreignTokenSymbol,
                address: foreignTokenAddress,
                userBalance: foreignTokenUserBalance,
                allowance: null
            }]
        });

        const escrowAgreementsLength = await contracts.Escrow.escrowAgreementsLength();
        let escrowAgreements = new Array(escrowAgreementsLength.toNumber()).fill({});
        escrowAgreements = await Promise.all(escrowAgreements.map(async (u, i) => {
            return contracts.Escrow.escrowAgreements(i);
        }));
        
        escrowAgreements = await Promise.all(escrowAgreements.map(async (escrowAgreement, index) => {
            const foreignToken = await contracts.ForeignERCTokenContract.at(escrowAgreement[3]);
            const foreignTokenName = await foreignToken.name();
            const foreignTokenSymbol = await foreignToken.symbol();
            return {
                state: EscrowState[EscrowState[escrowAgreement[0].toNumber()]],
                seller: escrowAgreement[1],
                buyer: escrowAgreement[2],
                foreignToken: `${foreignTokenName} (${foreignTokenSymbol})`,
                heldAmount: escrowAgreement[4],
                index
            }
        }));

        const isAdmin = await contracts.Escrow.isAdmin(window.web3.eth.coinbase);

        this.setState({escrowAgreements, isAdmin});
    }
    private renderEscrowAgreementRowAction(escrowAgreement: EscrowAgreement){
        if(escrowAgreement.state === EscrowState.held){
            if(escrowAgreement.seller === window.web3.eth.coinbase){
                return (
                    <td>
                        <button onClick={async () => {
                            await contracts.Escrow.allowPayOut(escrowAgreement.index, {from: window.web3.eth.coinbase});
                            this.update();
                        }}>Approve</button>
                        <button onClick={async () => {
                            await contracts.Escrow.triggerDispute(escrowAgreement.index, {from: window.web3.eth.coinbase});
                            this.update();
                        }}>Dispute</button>
                    </td>
                );
            }
            else if(escrowAgreement.buyer === window.web3.eth.coinbase){
                return (
                    <td>
                        <button onClick={async () => {
                            await contracts.Escrow.triggerDispute(escrowAgreement.index, {from: window.web3.eth.coinbase});
                            this.update();
                        }}>Dispute</button>
                    </td>
                );
            }
        }
        else if(escrowAgreement.state === EscrowState.disputed && this.state.isAdmin){
            return (
                    <td>
                        <button onClick={async () => {
                            await contracts.Escrow.resolveDispute(escrowAgreement.index, true, {from: window.web3.eth.coinbase});
                            this.update();
                        }}>Send Funds to Buyer</button>
                        <button onClick={async () => {
                            await contracts.Escrow.resolveDispute(escrowAgreement.index, false, {from: window.web3.eth.coinbase});
                            this.update();
                        }}>Send Funds to Seller</button>
                    </td>
                );
        }
        return null;
    }
    private renderEscrowAgreementRows(){
        return this.state.escrowAgreements.map((escrowAgreement, i) => {
            let state = '';
            switch (escrowAgreement.state){
                case EscrowState.disputed:
                    state = "Disputed"
                    break;
                case EscrowState.finished:
                    state = "Finished"
                    break;
                case EscrowState.held:
                    state = "Held"
                    break;
                default:
                    throw new TypeError();
            }
            return (
                <tr key={i}>
                    <td>
                        {state}
                    </td>
                    <td>
                        {escrowAgreement.seller.substr(0, 10)}...{escrowAgreement.seller.substr(-10)}
                    </td>
                    <td>
                        {escrowAgreement.buyer.substr(0, 10)}...{escrowAgreement.buyer.substr(-10)}
                    </td>
                    <td>
                        {escrowAgreement.foreignToken}
                    </td>
                    <td>
                        {escrowAgreement.heldAmount.toNumber()}
                    </td>
                    {this.renderEscrowAgreementRowAction(escrowAgreement)}
                </tr>
            );
        });
    }
    private renderWithdrawlSection(){
        const currentToken = this.state.tokens.filter((token) => token.address === this.state.escrowTokenAddress)[0];
        const disableEscrowButton = currentToken ? !currentToken.userBalance.greaterThanOrEqualTo(this.state.escrowAmount) : false                
        return (
            <div>
                <h2>Withdrawl Funds</h2>
                Token: <select value={this.state.escrowTokenAddress} onChange={(event) => {
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
                Your Balance Available for Withdrawl: {currentToken ? currentToken.userBalance.toNumber() : "N/A"}<br />

                <button disabled={disableEscrowButton} onClick={async () => {
                    const foreignToken = await contracts.ForeignERCTokenContract.at(this.state.escrowTokenAddress);
                    await foreignToken.transferFrom(
                        contracts.Escrow.address,
                        window.web3.eth.coinbase,
                        this.state.escrowAmount,
                        {from: window.web3.eth.coinbase}
                    );
                }}>Withdrawl Funds</button><br/>
            </div>
        );
    }
    public render(){
        return (
            <div className="trades-page">
                <h2>Active Trades</h2>
                <table>
                    <thead>
                        <tr>
                            <th>
                                State
                            </th>
                            <th>
                                Seller
                            </th>
                            <th>
                                Buyer
                            </th>
                            <th>
                                Token
                            </th>
                            <th>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderEscrowAgreementRows()}
                    </tbody>
                </table>
                {this.renderWithdrawlSection()}
                <Route path="/trades/:to/" component={TradePage} />
            </div>
        );
    }
}