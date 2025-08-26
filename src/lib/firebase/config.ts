import { getFirebaseFirestore } from 'bndy-ui/auth';

// Use a function to get the db instance when needed  
export const getDb = () => {
  const firestore = getFirebaseFirestore();
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  
  // Firebase v9+ compatibility: Handle both old and new SDK formats
  // Check if it's a valid Firestore instance by looking for essential properties
  const isValidFirestore = 
    firestore &&
    (typeof firestore === 'object') &&
    (firestore.app || firestore._delegate?.app || firestore.type === 'firestore');
  
  if (!isValidFirestore) {
    console.error('[Firebase Config] Invalid firestore instance - not a proper Firestore object:', firestore);
    throw new Error('Invalid Firestore instance - not a proper Firestore object');
  }
  
  // For compatibility with different Firebase SDK versions, return the firestore instance as-is
  // The modular functions (doc, collection, etc.) will handle the proper interface
  return firestore;
};