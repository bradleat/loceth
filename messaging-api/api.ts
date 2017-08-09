import {Router} from 'express';
import * as bodyParser from 'body-parser';
import * as UUID from 'uuid';
import * as Joi from 'joi';
import {attempt} from 'joi';


const api: Router = Router();

interface IMessage {
    id: string;
    encryptedText: string;
    encryptedTextForSender: string;
    date: string;
    from: string;
    to: string;
}

export const postBodySchema = Joi.object().keys({
    encryptedText: Joi.string(),
    encryptedTextForSender: Joi.string()
});

interface ISpecificThreadParamSchema {
    to: string;
}
export const specificThreadParamSchema = Joi.object().keys({
    to: Joi.string().length(42),
})

const storage = {} as {[id: string]: IMessage};

api.route('/threads')
.get(async (req, res) => {
    const messages = Object.keys(storage)
    .filter((key) => storage[key].from === req.headers.account || storage[key].to === req.headers.account)
    .map((key) => storage[key]);

    const threads = {} as {[counterparty: string]: {count: number, lastUpdated: string, counterparty: string}};

    messages.forEach((message) => {
        if(message.from === req.headers.account){
            if(!threads[message.to]){
                threads[message.to] = {
                    count: 1,
                    lastUpdated: message.date,
                    counterparty: message.to
                };
            }
            else {
                ++threads[message.to].count;
                if(message.date > threads[message.to].lastUpdated){
                    threads[message.to].lastUpdated = message.date;
                }
            }
        }
        else {
            if(!threads[message.from]){
                threads[message.from] = {
                    count: 1,
                    lastUpdated: message.date,
                    counterparty: message.from
                };
            }
            else {
                ++threads[message.from].count;
                if(message.date > threads[message.from].lastUpdated){
                    threads[message.from].lastUpdated = message.date;
                }
            }
        }
    });
    const arrayOfThreads = Object.keys(threads).map((counterparty) => {
        return threads[counterparty];
    });
    res.send(arrayOfThreads);
});

api.route('/threads/:to')
.get(async (req, res) => {
    const {to} = attempt(req.params, specificThreadParamSchema) as ISpecificThreadParamSchema;
    const messages = Object.keys(storage)
    .filter((key) => {
        if(storage[key].to === to && storage[key].from === req.headers.account){
            return true;
        }
        else if (storage[key].from === to && storage[key].to === req.headers.account){
            return true;
        }
        return false;
    })
    .map((key) => storage[key]);
    res.send(messages);
})
.post(bodyParser.json(), async (req, res) => {
    try {
        const message = attempt(req.body, postBodySchema) as IMessage;
        const {to} = attempt(req.params, specificThreadParamSchema) as ISpecificThreadParamSchema;
        message.id = UUID.v1();
        message.date = new Date().toISOString();
        message.to = to;
        message.from = req.headers.account;
        storage[message.id] = message;
        res.send({id: message.id});
    }
    catch (error) {
        res.status(400).send();
    }
});


export default api;
