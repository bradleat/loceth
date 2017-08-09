import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';

export default class HomePage extends React.Component<RouteComponentProps<any>, any> {
    public render(){
        return (
            <div className="home-page">
                <h2>Welcome to</h2>
                <h1>loc<b>eth</b></h1>

                <p>
                    Local Ether is a platform of decentralized exchange between
                    Ethereum/ERC20 token and fiat. Local Ether makes use of smart contracts
                    to facilitate trades and protect buyers and sellers. Local Ether provides
                    a medium of exchange that offers incentives to those that act as administrators
                    (for dispute management), as well as holder of our native token (LOC), which gives
                    a state of ownership to loceth's accumulated network fees.
                </p>
            </div>
        );
    }
}
