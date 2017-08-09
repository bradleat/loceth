import * as React from 'react';
import {render} from 'react-dom';
import {BrowserRouter, Switch, Route, RouteComponentProps} from 'react-router-dom';

import {IWeb3Window, getContracts} from './chain';
declare const window: IWeb3Window;

import NavBar from './nav-bar';
import HomePage from './home-page';
import OfferPage from './offer-page';
import ProfilePage from './profile-page';
import MessagesPage from './messages-page';
import TradesPage from './trades-page';

window.addEventListener('load', async () => {
    await getContracts();
    render(
        <BrowserRouter children={
            <div>
                <Route path='/' component={NavBar} />
                <Switch>
                    <Route path="/trades" component={TradesPage} />
                    <Route path="/messages" component={MessagesPage} />
                    <Route path="/profile" component={ProfilePage} />
                    <Route path="/offers" component={OfferPage} />
                    <Route path="/" component={HomePage} />
                </Switch>
            </div>
        } />,
        document.getElementById('site-outlet')
    );
});
