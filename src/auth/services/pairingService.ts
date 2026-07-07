import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Helper functions to parse Firestore REST API response fields
export function parseFirestoreRestField(field: any): any {
  if (!field) return null;
  if ('stringValue' in field) return field.stringValue;
  if ('booleanValue' in field) return field.booleanValue;
  if ('integerValue' in field) return parseInt(field.integerValue, 10);
  if ('doubleValue' in field) return parseFloat(field.doubleValue);
  if ('mapValue' in field) {
    const fields = field.mapValue.fields || {};
    const obj: any = {};
    for (const key of Object.keys(fields)) {
      obj[key] = parseFirestoreRestField(fields[key]);
    }
    return obj;
  }
  if ('arrayValue' in field) {
    const values = field.arrayValue.values || [];
    return values.map((val: any) => parseFirestoreRestField(val));
  }
  if ('nullValue' in field) return null;
  return null;
}

export function parseFirestoreRestDoc(fields: any): any {
  const result: any = {};
  if (!fields) return result;
  for (const key of Object.keys(fields)) {
    result[key] = parseFirestoreRestField(fields[key]);
  }
  return result;
}

/**
 * Direct REST fetch to avoid hung websockets
 */
export async function fetchPairingStatusRest(pairingCode: string): Promise<any | null> {
  const restUrl = `https://firestore.googleapis.com/v1/projects/studyos-001/databases/ai-studio-studyos-dab98d62-f9f3-4125-906a-d48f2df82335/documents/device_links/${pairingCode}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(restUrl, { 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const json = await resp.json();
      if (json && json.fields) {
        return parseFirestoreRestDoc(json.fields);
      }
    } else if (resp.status === 404) {
      console.log("[TRACER] [REST Fallback] Document not found (404). Active/completed pairing bridge deleted.");
    } else {
      console.warn("[TRACER] [REST Fallback] Fetch returned status:", resp.status);
    }
  } catch (restErr: any) {
    console.warn("[TRACER] [REST Fallback] Fetch request failed or timed out:", restErr?.message || restErr);
  }
  return null;
}

/**
 * Standard getDoc SDK fallback
 */
export async function fetchPairingStatusSDK(pairingCode: string): Promise<any | null> {
  try {
    const docRef = doc(db, "device_links", pairingCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (dbErr: any) {
    console.warn("[TRACER] [Focus/Resume] Standard SDK getDoc failed or timed out:", dbErr?.message || dbErr);
  }
  return null;
}

/**
 * Immediate document cleanup for security
 */
export async function deletePairingDoc(pairingCode: string): Promise<void> {
  try {
    console.log("[TRACER] [Firestore] Deleting pairing bridge document from Firestore for code:", pairingCode);
    await deleteDoc(doc(db, "device_links", pairingCode));
    console.log("[TRACER] [Firestore] Pairing bridge document deleted successfully.");
  } catch (delErr: any) {
    console.warn("[TRACER] [Firestore] Failed to delete pairing document:", {
      code: delErr?.code,
      message: delErr?.message,
      stack: delErr?.stack
    });
  }
}
