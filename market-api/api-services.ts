import {
    Listing,
    ListingWithId,
    ListingId,
    Prices,
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

function INTERNAL(object: LocethMarketApiServices) {
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
 * The Market API is used to query and set orders on the Loceth order book
 * @class LocethMarketApiServices
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class LocethMarketApiServices {

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
     * Get the most recent ask and bid prices.
     * @method
     * @name LocethMarketApiServices#getPrices
     */
    public async getPrices(): Promise < Prices > {

        let path = '/market-api/prices';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
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
     * Get a list of all `Listing`.
     * @method
     * @name LocethMarketApiServices#getListings
     */
    public async getListings(): Promise < ListingWithId[] > {

        let path = '/market-api/listings';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
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
     * Add a new `listing`
     * @method
     * @name LocethMarketApiServices#addListing
     * @param {} body - The listing
     */
    public async addListing(
        body: Listing,
    ): Promise < ListingId > {

        let path = '/market-api/listings';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers['Content-Type'] = 'application/json';

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
        } else if (response.status === 404) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
            throw new HttpResponseError(responseObject);
        } else if (response.status === 409) {
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
    /**
     * Get a `Listing` by its id.
     * @method
     * @name LocethMarketApiServices#getListing
     * @param {string} listingId - listing id
     */
    public async getListing(
        listingId: string,
    ): Promise < ListingWithId > {

        let path = '/market-api/listings/{listingId}';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers['Content-Type'] = 'application/json';

        path = path.replace('{listingId}', String(listingId));

        if (listingId === undefined) {
            throw new Error('Missing required  parameter: listingId');
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
        } else if (response.status === 404) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
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
    /**
     * Delete a `Listing` by its id.
     * @method
     * @name LocethMarketApiServices#deleteListing
     * @param {string} listingId - listing id
     */
    public async deleteListing(
        listingId: string,
    ): Promise < any > {

        let path = '/market-api/listings/{listingId}';
        let formBody: any;
        let queryParameters: any = {};
        let headers: any = {};
        // headers['X-Loceth-Version'] = '2017-07-18';
        headers['Content-Type'] = 'application/json';

        path = path.replace('{listingId}', String(listingId));

        if (listingId === undefined) {
            throw new Error('Missing required  parameter: listingId');
        }

        const request = new Request(
            `${this.protocol}://${this.domain}:${this.port}${path}?${qs.stringify(queryParameters)}`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify(formBody)
            }
        );
        const response = await fetch(request);
        if (response.status === 200) {
            const responseObject = await response.json();
            return responseObject;
        } else if (response.status === 404) {
            const responseObject = {
                code: response.status,
                message: response.statusText,
                status: response.status,
                statusText: response.statusText
            };
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
