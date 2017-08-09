import {
    MessagePost,
    MessageWithId,
    MessageId,
    Thread,
    Error,
} from './api-types';
import * as qs from 'querystring';

export * from './api-types';

export type ServiceConfig = {
    domain: string;
    protocol: 'https' | 'http';
    port: number;
};

const INTERNAL_MAP = new WeakMap();

function INTERNAL(object: LocethMessagingApiServices) {
    if (!INTERNAL_MAP.has(object)) {
        INTERNAL_MAP.set(object, {});
    }
    return INTERNAL_MAP.get(object) as ServiceConfig;
}

import fetchPonyfill = require('fetch-ponyfill');
import fetchType from 'node-fetch';
import * as fetchTypes from 'node-fetch';

const {
    fetch,
    Request
}: {
    fetch: typeof fetchType,
    Request: typeof fetchTypes.Request
} = fetchPonyfill();

class HttpResponseError extends Error {
    public readonly code: number | string;
    public readonly message: string;
    public readonly status: number;
    public readonly statusText: string;

    constructor({
        code,
        message,
        status,
        statusText
    }: {
        code: number | string,
        message: string,
        status: number,
        statusText: string
    }) {
        super();
        this.code = code;
        this.message = message;
        this.status = status;
        this.statusText = statusText;
    }
}

/**
 * The Messaging API is used to query and set orders on the Loceth order book
 * @class LocethMessagingApiServices
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class LocethMessagingApiServices {

    public get domain(): string {
        return INTERNAL(this).domain;
    }
    public get protocol(): 'http' | 'https' {
        return INTERNAL(this).protocol;
    }
    public get port(): number {
        return INTERNAL(this).port;
    }

    constructor({
        domain = "",
        protocol = 'https',
        port = 80
    }: {
        domain: string,
        protocol: 'http' | 'https',
        port: number
    }) {
        if (typeof domain !== 'string') {
            throw new TypeError('domain must be a string');
        } else if ((protocol as string) !== 'http' && (protocol as string) !== 'https') {
            throw new TypeError('protocol must be "http" or "https"');
        } else if (typeof port !== 'number') {
            throw new TypeError('port must be a number');
        }
        INTERNAL(this).domain = domain;
        INTERNAL(this).protocol = protocol;
        INTERNAL(this).port = port;
    }

    /**
     * Get the threads the user has partcipated in.
     * @method
     * @name LocethMessagingApiServices#getThreads
     */
    public async getThreads(): Promise < Thread[] > {

        let path = '/messaging-api/threads';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers.account = window.web3.eth.coinbase;
        headers['Content-Type'] = 'application/json';

        const request = new Request(
            `${this.protocol}://${this.domain}:${this.port}${path}?${qs.stringify(queryParameters)}`, {
                method: 'GET',
                headers,
                body: JSON.stringify(formBody)
            }
        );
        const response = await fetch(request);
        if (response.status === 200) {
            const responseObject = await response.json();
            return responseObject;
        } else if (response.status === 500) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
            throw new HttpResponseError(responseObject);
        }

    };
    /**
     * Get a `thread`.
     * @method
     * @name LocethMessagingApiServices#getMessages
     * @param {string} to - other party to the thread
     */
    public async getMessages(
        to: string,
    ): Promise < MessageWithId[] > {

        let path = '/messaging-api/threads/{to}';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers.account = window.web3.eth.coinbase;
        headers['Content-Type'] = 'application/json';

        path = path.replace('{to}', String(to));

        if (to === undefined) {
            throw new Error('Missing required  parameter: to');
        }

        const request = new Request(
            `${this.protocol}://${this.domain}:${this.port}${path}?${qs.stringify(queryParameters)}`, {
                method: 'GET',
                headers,
                body: JSON.stringify(formBody)
            }
        );
        const response = await fetch(request);
        if (response.status === 200) {
            const responseObject = await response.json();
            return responseObject;
        } else if (response.status === 500) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
            throw new HttpResponseError(responseObject);
        }

    };
    /**
     * Add a new `message` to a `thread`.
     * @method
     * @name LocethMessagingApiServices#sendMessage
     * @param {string} to - other party to the thread
     * @param {} body - The listing
     */
    public async sendMessage(
        to: string,
        body: MessagePost,
    ): Promise < MessageId > {

        let path = '/messaging-api/threads/{to}';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers.account = window.web3.eth.coinbase;
        headers['Content-Type'] = 'application/json';

        path = path.replace('{to}', String(to));

        if (to === undefined) {
            throw new Error('Missing required  parameter: to');
        }

        if (body !== undefined) {
            formBody = body;
        }

        if (body === undefined) {
            throw new Error('Missing required  parameter: body');
        }

        const request = new Request(
            `${this.protocol}://${this.domain}:${this.port}${path}?${qs.stringify(queryParameters)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(formBody)
            }
        );
        const response = await fetch(request);
        if (response.status === 200) {
            const responseObject = await response.json();
            return responseObject;
        } else if (response.status === 400) {
            const responseObject = await response.json();
            responseObject.status = response.status;
            responseObject.statusText = response.statusText;
            throw new HttpResponseError(responseObject);
        } else if (response.status === 500) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
            throw new HttpResponseError(responseObject);
        }

    };
}
