import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Doctor } from '../types';

interface RedirectDestination {
  tab: string;
  doctor?: Doctor | null;
  departmentId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signUpWithEmail: (fullName: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; code?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signOut: () => Promise<void>;
  updateProfileData: (displayName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  redirectDestination: RedirectDestination | null;
  setRedirectDestination: (dest: RedirectDestination | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [redirectDestination, setRedirectDestination] = useState<RedirectDestination | null>(null);

  // Sync user profile from Firestore or create on first sign-in
  const syncUserProfile = async (fbUser: FirebaseUser, overrideName?: string, overridePhone?: string) => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUser(data);
      } else {
        const newProfile: UserProfile = {
          userId: fbUser.uid,
          email: fbUser.email || '',
          displayName: overrideName || fbUser.displayName || 'Patient',
          phone: overridePhone || '',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUser(newProfile);
      }
    } catch (err) {
      console.error('Error fetching/saving user profile in Firestore:', err);
      // Fallback local profile if network delay
      setUser({
        userId: fbUser.uid,
        email: fbUser.email || '',
        displayName: overrideName || fbUser.displayName || 'Patient',
        phone: overridePhone || '',
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(res.user);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase SignIn Error:', err);
      const code = err?.code || '';
      let msg = 'Failed to sign in. Please verify your email and password.';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'Invalid credentials or account not found. If you are a new patient, please create an account first.';
      } else if (code === 'auth/invalid-email') {
        msg = 'The email address is improperly formatted.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to multiple failed attempts. Try again later or reset your password.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is not enabled in Firebase Console. Please use "Continue with Google" or enable the Email/Password provider in the Firebase Authentication settings.';
      }
      return { success: false, error: msg, code };
    }
  };

  const signUpWithEmail = async (fullName: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: fullName.trim() });
      await syncUserProfile(res.user, fullName.trim(), phone?.trim());
      return { success: true };
    } catch (err: any) {
      console.error('Firebase SignUp Error:', err);
      const code = err?.code || '';
      let msg = 'Failed to create account. Please try again.';
      if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Invalid email address provided.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Email/Password registration is not enabled in Firebase Console. Please use "Continue with Google" or enable Email/Password provider in Firebase Console.';
      }
      return { success: false, error: msg, code };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(res.user);
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      const code = err?.code || '';
      let msg = 'Google authentication was cancelled or failed.';
      if (code === 'auth/popup-closed-by-user') {
        msg = 'Sign in was cancelled.';
      }
      return { success: false, error: msg, code };
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.error('Password reset error:', err);
      const code = err?.code || '';
      let msg = 'Failed to send password reset email.';
      if (code === 'auth/user-not-found') {
        msg = 'No user account found with this email address.';
      }
      return { success: false, error: msg, code };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const updateProfileData = async (displayName: string, phone?: string) => {
    if (!firebaseUser) return { success: false, error: 'User is not signed in.' };
    try {
      await updateProfile(firebaseUser, { displayName: displayName.trim() });
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const updated: Partial<UserProfile> = {
        displayName: displayName.trim(),
        phone: phone ? phone.trim() : '',
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, updated, { merge: true });
      setUser((prev) => (prev ? { ...prev, ...updated } : null));
      return { success: true };
    } catch (err: any) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Could not update profile information.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOut,
        updateProfileData,
        redirectDestination,
        setRedirectDestination
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
