import * as Http from 'http';
import * as Express from 'express';
import * as morgan from 'morgan';
import {getPackage, LoggingLevel} from 'loceth-config';

import api from './api';

async function main() {

    const app = Express();
    const settings = await getPackage('loceth-market-api');

    app.get('/ping', (req, res) => {
        return res.status(204).send();
    });

    if(settings.logging === LoggingLevel.Detailed){
        app.use(morgan('combined'));
    }
    else {
        app.use(morgan('common'));
    }

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.use('/market-api', api);

    const server = Http.createServer(app);
    server.listen(settings.port, async () => {
        process.stdout.write(`Listening on port ${settings.port}.`);
    });
}

main();
