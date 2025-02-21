// src/utils/didUtils.js

export async function resolveDIDToHandle(did) {
    try {
      // Only process if it's a DID
      if (!did.startsWith('did:')) {
        return null;
      }
  
      // Fetch the DID document from PLC directory
      const response = await fetch(`https://plc.directory/${encodeURIComponent(did)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch DID document');
      }
  
      const data = await response.json();
      
      // Look for alsoKnownAs array
      if (!data.alsoKnownAs || !Array.isArray(data.alsoKnownAs) || data.alsoKnownAs.length === 0) {
        throw new Error('No aliases found for this DID');
      }
  
      // Find the first at:// handle
      const handle = data.alsoKnownAs
        .find(alias => alias.startsWith('at://'))
        ?.replace('at://', '');
  
      if (!handle) {
        throw new Error('No valid handle found for this DID');
      }
  
      return handle;
    } catch (error) {
      console.error('Error resolving DID:', error);
      throw error;
    }
  }
  
  export function isDID(input) {
    return input.startsWith('did:plc:') || input.startsWith('did:web:');
  }