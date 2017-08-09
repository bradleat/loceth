import * as Http from 'http';
import * as Express from 'express';
import * as morgan from 'morgan';
import {getPackage, LoggingLevel} from 'loceth-config';

import www from './routes/www';

async function main() {

    const app = Express();
    const settings = await getPackage('loceth-web');

    app.get('/ping', (req, res) => {
        return res.status(204).send();
    });

    if(settings.logging === LoggingLevel.Detailed){
        app.use(morgan('combined'));
    }
    else {
        app.use(morgan('common'));
    }

    app.use(www);

    const server = Http.createServer(app);
    server.listen(settings.port, async () => {
        process.stdout.write(`Listening on port ${settings.port}.`);
    });
}

main();
