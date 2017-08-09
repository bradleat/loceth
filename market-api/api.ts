import {Router} from 'express';
import * as bodyParser from 'body-parser';
import * as UUID from 'uuid';
import * as Joi from 'joi';
import {attempt} from 'joi';
import * as Gdax from 'Gdax';

const orderbooks = new Gdax.OrderbookSync(['ETH-USD']);


const api: Router = Router();

type PaymentMethods = 'Paypal' | 'Facebook' | 'Squarecash' | 'Venmo';
type Assets = 'USD' | 'LOC' | 'ETH';

interface IListing {
    id: string;
    account: string;
    methods: PaymentMethods[];
    minSold: number;
    maxSold: number;
    marketPricePercentage: number;
    buying: Assets;
    selling: Assets;
    date: string;
}

export const postBodySchema = Joi.object().keys({
    account: Joi.string().length(42),
    methods: Joi.array().items(Joi.string().allow(['Paypal', 'Facebook', 'Squarecash', 'Venmo'])).unique(),
    minSold: Joi.number(),
    maxSold: Joi.number(),
    marketPricePercentage: Joi.number().min(90).max(120),
    buying: Joi.string().allow(['USD', 'LOC', 'ETH']),
    selling: Joi.string().allow(['USD', 'LOC', 'ETH'])
});

const storage = {} as {[id: string]: IListing};

api.route('/listings')
.get(async (req, res) => {
    const listings = Object.keys(storage).map((key) => storage[key]);
    res.send(listings);
})
.post(bodyParser.json(), async (req, res) => {
    try {
        const listing = attempt(req.body, postBodySchema) as IListing;
        listing.id = UUID.v1();
        listing.date = new Date().toISOString();
        storage[listing.id] = listing;
        res.send({id: listing.id});
    }
    catch (error) {
        res.status(400).send();
    }
});

api.route('/listings/:id')
.get(async (req, res) => {
    res.send(storage[req.params.id]);
})
.delete(async (req, res) => {
    delete storage[req.params.id];
    res.send();
});

api.get('/prices', (req, res) => {
    try {
        res.send({
            ask: Number(orderbooks.books['ETH-USD'].state().asks[0].price),
            bid: Number(orderbooks.books['ETH-USD'].state().bids[0].price)
        });
    }
    catch (error) {
        res.status(500).send();
    }
});

export default api;
