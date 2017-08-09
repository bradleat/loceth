export type Listing = {
    account: string;
    methods: string[];
    minSold: number;
    maxSold: number;
    marketPricePercentage: number;
    buying: string;
    selling: string;
};
export type ListingWithId = {
    id: string;
    account: string;
    methods: string[];
    minSold: number;
    maxSold: number;
    marketPricePercentage: number;
    buying: string;
    selling: string;
};
export type ListingId = {
    id: string;
};
export type Prices = {
    ask: number;
    bid: number;
};
export type Error = {
    code: number;
    message: string;
};
