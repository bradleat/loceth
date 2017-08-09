import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import LocethMarketApiServices, {ListingWithId} from 'loceth-market-api';
const {port, host, protocol} = require('loceth-market-api/package') as {port: number, host: string, protocol: 'http' | 'https'};

import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export enum BuySellOfferModalDisplay {
    none,
    buy,
    sell
}
export interface IOfferPageState {
    showModal: BuySellOfferModalDisplay;
    listings: ListingWithId[];
    ask: number;
    bid: number;
    sellMethodOptions: string[];
    sellPercentageOfMarketPrice: number;
    sellMin: number;
    sellMax: number;
}

export default class OfferPage extends React.Component<RouteComponentProps<any>, IOfferPageState> {
    private api: LocethMarketApiServices;
    constructor(){
        super();
        this.state = {
            showModal: BuySellOfferModalDisplay.none,
            listings: [],
            ask: 1,
            bid: 1,
            sellMethodOptions: [],
            sellPercentageOfMarketPrice: 100,
            sellMin: 0,
            sellMax: 0,
        };
        this.api = new LocethMarketApiServices({port, protocol, domain: host});
        this.update();
    }
    private async update(){
        const listings = await this.api.getListings();
        const prices = await this.api.getPrices();        
        this.setState({listings, bid: prices.bid, ask: prices.ask});
    }
    // private renderCreateBuyOffer(){
    //     if(this.state.showModal === BuySellOfferModalDisplay.buy){
    //         return (
    //             <div className="create-offer">
    //                 <table><tbody>
    //                     <tr>
    //                         <td>Buy</td>
    //                         <td><select>
    //                             <option>ETH</option>
    //                             {/*<option>LOC</option>*/}
    //                         </select> with USD</td>
    //                     </tr>
    //                     <tr>
    //                         <td>Method</td>
    //                         <td><select multiple onChange={(event) => {
    //                             const options = [] as string[];
    //                             for (let index = 0; index < event.target.selectedOptions.length; index++) {
    //                                 let option = event.target.selectedOptions[index].value;
    //                                 options.push(option);
    //                             }
    //                             this.setState({buyMethodOptions: options});
    //                         }}>
    //                             <option>Venmo</option>
    //                             <option>Paypal</option>
    //                             <option>Facebook</option>
    //                             <option>Squarecash</option>
    //                             <option>Other (online)</option>
    //                         </select></td>
    //                     </tr>
    //                     <tr>
    //                         <td>Percentage of Market Price</td>
    //                         <td><input type="number" onChange={(event) => {
    //                             this.setState({buyPercentageOfMarketPrice: Number(event.target.value)});
    //                         }}/></td>
    //                     </tr>
    //                     <tr>
    //                         <td>Min (USD)</td>
    //                         <td><input type="number" onChange={(event) => {
    //                             this.setState({buyMin: Number(event.target.value)});
    //                         }} /></td>
    //                     </tr>
    //                     <tr>
    //                         <td>Max (USD)</td>
    //                         <td><input type="number" onChange={(event) => {
    //                             this.setState({buyMax: Number(event.target.value)});
    //                         }} /></td>
    //                     </tr>
    //                 </tbody></table>
    //                 <button onClick={() => {
    //                     this.setState({showModal: BuySellOfferModalDisplay.none});
    //                 }}>Cancel</button>
    //                 <button onClick={async () => {
    //                     await this.api.addListing({
    //                         account: window.web3.eth.coinbase,
    //                         methods: this.state.buyMethodOptions,
    //                         minSold: this.state.buyMin,
    //                         maxSold: this.state.buyMax,
    //                         marketPricePercentage: this.state.buyPercentageOfMarketPrice,
    //                         buying: 'ETH',
    //                         selling: 'USD'
    //                     });
    //                     this.update();
    //                 }}>Confirm</button>
    //             </div>
    //         );
    //     }
    //     else {
    //         return null;
    //     }
    // }
    private renderCreateSellOffer(){
        if(this.state.showModal === BuySellOfferModalDisplay.sell){
            return (
                <div className="create-offer">
                    <table><tbody>
                        <tr>
                            <td>Sell</td>
                            <td><select>
                                <option>ETH</option>
                                {/*<option>LOC</option>*/}
                            </select> to USD</td>
                        </tr>
                        <tr>
                            <td>Method</td>
                            <td><select multiple onChange={(event) => {
                                const options = [] as string[];
                                for (let index = 0; index < event.target.selectedOptions.length; index++) {
                                    let option = event.target.selectedOptions[index].value;
                                    options.push(option);
                                }
                                this.setState({sellMethodOptions: options});
                            }}>
                                <option>Venmo</option>
                                <option>Paypal</option>
                                <option>Facebook</option>
                                <option>Squarecash</option>
                                <option>Other (online)</option>
                            </select></td>
                        </tr>
                        <tr>
                            <td>Percentage of Market Price</td>
                            <td><input type="number" onChange={(event) => {
                                this.setState({sellPercentageOfMarketPrice: Number(event.target.value)});
                            }}/></td>
                        </tr>
                        <tr>
                            <td>Min (Coin)</td>
                            <td><input type="number" onChange={(event) => {
                                this.setState({sellMin: Number(event.target.value)});
                            }}/></td>
                        </tr>
                        <tr>
                            <td>Max (Coin)</td>
                            <td><input type="number" onChange={(event) => {
                                this.setState({sellMax: Number(event.target.value)});
                            }}/></td>
                        </tr>
                    </tbody></table>
                    <button onClick={() => {
                        this.setState({showModal: BuySellOfferModalDisplay.none});
                    }}>Cancel</button>
                    <button onClick={async () => {
                        await this.api.addListing({
                            account: window.web3.eth.coinbase,
                            methods: this.state.sellMethodOptions,
                            minSold: this.state.sellMin,
                            maxSold: this.state.sellMax,
                            marketPricePercentage: this.state.sellPercentageOfMarketPrice,
                            buying: 'USD',
                            selling: 'ETH'
                        });
                        this.update();
                    }}>Confirm</button>
                </div>
            );
        }
        else {
            return null;
        }
    }
    private renderOfferRows(selling: string, buying: string){
        return this.state.listings
        .filter((listing) => {
            return listing.selling === selling && listing.buying === buying
        })
        .map((listing) => {
            let marketAvg = (this.state.bid + this.state.ask) / 2;
            let price = marketAvg * (listing.marketPricePercentage / 100);
            return (<tr key={listing.id} onClick={() => {
                    this.props.history.push(`/messages/${listing.account}`);
                }}>
                <td>{listing.account}</td>
                <td>{listing.methods.join(', ')}</td>
                <td>{listing.minSold} {selling} - {listing.maxSold} {selling}</td>
                <td>{price.toFixed(2)} USD</td>
            </tr>);
        });
    }
    public render(){
        return (
            <div className="offer-page">
                <div>
                    Exchange USD for <select>
                        <option>ETH</option>
                        {/*<option>LOC</option>*/}
                    </select>
                </div>
                <div className="offer-buttons">
                    {/*<button onClick={() => {
                        this.setState({showModal: BuySellOfferModalDisplay.buy});
                    }}>Create Buy Offer</button>*/}
                    <button onClick={() => {
                        this.setState({showModal: BuySellOfferModalDisplay.sell});
                    }}>Create Sell Offer</button>
                </div>
                {/*{this.renderCreateBuyOffer()}*/}
                {this.renderCreateSellOffer()}
                {/*<h2>Buy Offers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Buyer</th>
                            <th>Method</th>
                            <th>Min - Max</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderOfferRows('USD', 'ETH')}
                    </tbody>
                </table>*/}
                <h2>Sell Offers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Seller</th>
                            <th>Method</th>
                            <th>Min - Max</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderOfferRows('ETH', 'USD')}
                    </tbody>
                </table>
            </div>
        );
    }
}
