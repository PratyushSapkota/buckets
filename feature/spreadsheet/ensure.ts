import "server-only";
import { findSpreadsheet } from "./find";
import { createSpreadsheet } from "./create";


export async function ensureSpreadsheet(googleUserId: string) {
    const existingSpreadsheetId = await findSpreadsheet(googleUserId)
    
    if (existingSpreadsheetId) {
        return existingSpreadsheetId
    }

    return await createSpreadsheet(googleUserId);
    
}