import { User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from './config';
import type { UserRole } from 'bndy-types';

export type SourceApp = 'portal' | 'backstage' | 'frontstage' | 'centrestage';

export function getRolesForSourceApp(sourceApp: SourceApp): UserRole[] {
  switch (sourceApp) {
    case 'backstage':
      return ['user', 'bndy_artist', 'bndy_studio'];
    case 'frontstage':
      return ['user', 'live_giggoer'];
    case 'centrestage':
    case 'portal':
    default:
      return ['user'];
  }
}

export async function createUserProfile(user: User, sourceApp: SourceApp): Promise<void> {
  const db = getDb();
  const userDocRef = doc(db, 'bndy_users', user.uid);
  
  // Extract auth provider from providerData
  const authProvider = user.providerData?.[0]?.providerId || 'email';
  
  const profileData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    emailVerified: user.emailVerified || false,
    phoneNumber: user.phoneNumber || null,
    roles: getRolesForSourceApp(sourceApp),
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    sourceApp,
    authProvider
  };

  await setDoc(userDocRef, profileData, { merge: true });
}

export async function updateUserProfile(uid: string, updates: Record<string, any>): Promise<void> {
  const userDocRef = doc(getDb(), 'bndy_users', uid);
  await updateDoc(userDocRef, updates);
}

export async function getUserProfile(uid: string): Promise<any | null> {
  const userDocRef = doc(getDb(), 'bndy_users', uid);
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  }
  
  return null;
}

export async function ensureUserProfileExists(user: User, sourceApp: SourceApp): Promise<boolean> {
  const db = getDb();
  const userDocRef = doc(db, 'bndy_users', user.uid);
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    // User exists, update lastLoginAt
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp()
    });
    return false; // Profile already existed
  }
  
  // User doesn't exist, create profile
  await createUserProfile(user, sourceApp);
  return true; // Profile was created
}