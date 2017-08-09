import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {pki} from 'node-forge';
import LocethMessagingApiServices, {MessageWithId} from 'loceth-messaging-api';
const {port, host, protocol} = require('loceth-messaging-api/package') as {port: number, host: string, protocol: 'http' | 'https'};

import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export interface IRouteParams {
    to: string;
}
export interface CryptoMessageWithId extends MessageWithId {
    plainText?: string;
}
export interface IMessagePageState {
    composing: string;
    privateKey: string;
    messages: CryptoMessageWithId[]
}


export default class MessagePage extends React.Component<RouteComponentProps<IRouteParams>, IMessagePageState> {
    private api: LocethMessagingApiServices;
    constructor(props: RouteComponentProps<IRouteParams>){
        super();
        this.state = {
            composing: '',
            privateKey: '',
            messages: []
        };
        this.api = new LocethMessagingApiServices({port, protocol, domain: host});
        this.update(props.match.params);
    }
    private async update(params: IRouteParams){
        let messages = await this.api.getMessages(params.to) as CryptoMessageWithId[];
        if(this.state.privateKey){
            messages = messages.map((message) => {
                if(message.to === window.web3.eth.coinbase){
                    message.plainText = MessagePage.decryptMessageV1(this.state.privateKey, message.encryptedText);
                }
                else {
                    message.plainText = MessagePage.decryptMessageV1(this.state.privateKey, message.encryptedTextForSender);
                }
                return message;
            });
        }
        this.setState({messages});
    }
    private static async encryptMessageV1(to: string, message: string){
        const publicKeyPem = await contracts.LOCProfile.publicKeys(to) as string;
        const publicKey = pki.publicKeyFromPem(publicKeyPem);
        const encryptedText = publicKey.encrypt(message);

        const senderPublicKeyPem = await contracts.LOCProfile.publicKeys(window.web3.eth.coinbase);
        const senderPublicKey = pki.publicKeyFromPem(senderPublicKeyPem);
        const encryptedTextForSender = senderPublicKey.encrypt(message);

        return {encryptedText, encryptedTextForSender} as {encryptedText: string, encryptedTextForSender: string}
    }
    private static decryptMessageV1(privateKeyPem: string, encryptedMessage: string){
        const privateKey = pki.privateKeyFromPem(privateKeyPem);
        return privateKey.decrypt(encryptedMessage);
    }
    private renderMessages(){
        return this.state.messages.map((message) => {
            if(message.plainText){
                return (
                    <tr key={message.id}>
                        <td>
                            {message.from.substr(0, 10)}...{message.from.substr(-10)}
                        </td>
                        <td>
                            {message.date}
                        </td>
                        <td>
                            {message.plainText}
                        </td>
                    </tr>
                );
            }
            else {
                return (
                    <tr key={message.id}>
                        <td>
                            {message.from.substr(0, 10)}...{message.from.substr(-10)}
                        </td>
                        <td>
                            {message.date}
                        </td>
                        <td>
                            ***Encrypted***
                        </td>
                    </tr>
                );
            }
        })
    }
    public render(){
        return (
            <div className="message-page">
                <table>
                    <thead>
                        <tr>
                            <th>Sender</th>
                            <th>Date</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderMessages()}
                    </tbody>
                </table>
                <textarea onChange={(event) => {
                    this.setState({composing: event.target.value});
                }} value={this.state.composing} />
                <button onClick={async () => {
                    const encryptedMessages = await MessagePage.encryptMessageV1(this.props.match.params.to, this.state.composing);
                    await this.api.sendMessage(this.props.match.params.to, encryptedMessages);
                    this.update(this.props.match.params);
                }}>Send Message (Encrypted)</button>

                <button onClick={() => {
                    this.props.history.push(`/trades/${this.props.match.params.to}`);
                }}>Start Trade (as Seller)</button>
                
                
                <h2>Private Key</h2>
                <input type="password" onChange={(event) => {
                    this.setState({privateKey: event.target.value});
                }} value={this.state.privateKey} /><br />
                <button onClick={() => {
                    this.update(this.props.match.params);
                }}>Set Private Key to Decrypt Messages</button>
            </div>
        );
    }
}
