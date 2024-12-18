import * as t from "io-ts";

/**
 * BizEvents headers
 * This is the type of the headers returned by the BizEvents API
 * due to resolve wrong type error in the auto-generated client
 */
export const BizEventsHeaders = t.type({
  map: t.type({
    "x-continuation-token": t.string
  })
});

export const BizEventsDownloadReceiptHeaders = t.type({
  map: t.type({
    "content-disposition": t.string
  })
});

export type BizEventsHeaders = t.TypeOf<typeof BizEventsHeaders>;
export type BizEventsDownloadReceiptHeaders = t.TypeOf<
  typeof BizEventsDownloadReceiptHeaders
>;
