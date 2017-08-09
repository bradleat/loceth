import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';

import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export default class NavBar extends React.Component<RouteComponentProps<any>, any> {
    public render(){
        return (
            <nav>
                <div>
                    <span className="local">local</span>
                    <span className="ether">ether</span>
                </div>
                <div className="buttons">
                    <a href="/profile">profile</a>
                    <a href="/offers">offers</a>
                    <a href="/messages">messages</a>
                    <a href="/trades">trades</a>
                    {/*<a href="/burn">burn</a>*/}
                </div>
                <div className="account">
                    account: {window.web3.eth.coinbase.substr(0, 10)}...{window.web3.eth.coinbase.substr(-10)}
                </div>
            </nav>
        );
    }
}
