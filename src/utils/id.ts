import { customAlphabet } from "nanoid";

// 31 symbols, no 0/O/1/I/L, so ids are easy to read out
const ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const ORDER_ID_LENGTH = 8; // ≈ 8.5e11 ids
// Review ids are generated in the browser (the photo upload path needs one), so give them more room
const REVIEW_ID_LENGTH = 10; // ≈ 8.2e14 ids

export const generateOrderId = customAlphabet(ID_ALPHABET, ORDER_ID_LENGTH);
export const generateReviewId = customAlphabet(ID_ALPHABET, REVIEW_ID_LENGTH);
