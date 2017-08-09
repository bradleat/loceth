import * as React from 'react';
import {Route, RouteComponentProps} from 'react-router-dom';
import MessagePage from './message-page';
import LocethMessagingApiServices, {Thread} from 'loceth-messaging-api';
const {port, host, protocol} = require('loceth-messaging-api/package') as {port: number, host: string, protocol: 'http' | 'https'};

import {IWeb3Window, contracts} from './chain';
declare const window: IWeb3Window;

export interface IRouteParams {
    to?: string;
}
export interface IMessagesPageState {
    threads: Thread[]
}

export default class MessagesPage extends React.Component<RouteComponentProps<IRouteParams>, IMessagesPageState> {
    private api: LocethMessagingApiServices;
    constructor(props: RouteComponentProps<IRouteParams>){
        super();
        this.state = {
            threads: []
        };
        this.api = new LocethMessagingApiServices({port, protocol, domain: host});
        this.update();
    }
    private async update(){
        const threads = await this.api.getThreads();
        this.setState({threads});
    }
    private renderThreadList(){
        return this.state.threads.map((thread) => {
            return (
                <tr key={thread.counterparty} onClick={() => {
                        this.props.history.push(`/messages/${thread.counterparty}`);;
                    }}>
                    <td>{thread.counterparty.substr(0, 10)}...{thread.counterparty.substr(-10)}</td>
                    <td>{thread.lastUpdated}</td>
                    <td>{thread.count}</td>
                </tr>
            );
        });
    }
    public componentWillReceiveProps(){
        this.forceUpdate();
    }
    public render(){
        return (
            <div className="messages-page">
                <table className="thread-list">
                    <thead>
                        <tr>
                            <th>Counterparty</th>
                            <th>Last Updated</th>
                            <th>Message Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderThreadList()}
                    </tbody>

                </table>
                <Route path="/messages/:to/" component={MessagePage} />
            </div>
        );
    }
}
