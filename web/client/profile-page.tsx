import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';

import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export interface IProfilePageState {
    publicKey: string;
}
export default class ProfilePage extends React.Component<RouteComponentProps<any>, IProfilePageState> {
    constructor() {
        super();
        this.state = {
            publicKey: '',
        };
        this.update();
    }
    private async update(){
        const publicKey = await contracts.LOCProfile.publicKeys(window.web3.eth.coinbase);
        this.setState({publicKey});
    }
    public render(){
        return (
            <div className="profile-page">
                <h2>Profile:</h2>
                <p>
                    Here at Loceth, all we require is that you associate a public key
                    with your account that you will use for messaging within the Loceth system.
                </p>
                <h2>Public Key</h2>
                <textarea value={this.state.publicKey} onChange={(event) => {
                    this.setState({publicKey: event.target.value});
                }}/><br />
                <button onClick={async () => {
                    await contracts.LOCProfile.updateKey(this.state.publicKey, {from: window.web3.eth.coinbase});
                    this.update();
                }}>Update</button>
                <br />
                <button onClick={() => {
                    this.update();
                }}>Refresh/Reset</button>
            </div>
        );
    }
}