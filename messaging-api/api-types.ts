export type MessagePost = {
    encryptedText: string;
    encryptedTextForSender: string;
};
export type MessageWithId = {
    id: string;
    from: string;
    to: string;
    encryptedText: string;
    encryptedTextForSender: string;
    date: string;
    listingId: string;
};
export type MessageId = {
    id: string;
};
export type Thread = {
    count: number;
    counterparty: string;
    lastUpdated: string;
};
export type Error = {
    code: number;
    message: string;
};
