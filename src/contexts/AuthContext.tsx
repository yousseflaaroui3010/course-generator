import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider, FirebaseUser, OperationType, handleFirestoreError } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, limit, getDocs } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
  xp?: number;
  streak?: number;
  lastActive?: string;
  preferences: {
    darkMode: boolean;
    dyslexicFont: boolean;
  };
  subscription?: {
    status: string;
    planId: string;
    currentPeriodEnd: string;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (role?: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  awardXP: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            
            // Fetch active subscription
            try {
              const subsRef = collection(db, 'users', firebaseUser.uid, 'subscriptions');
              const q = query(subsRef, where('status', '==', 'active'), limit(1));
              const subSnap = await getDocs(q);
              
              if (!subSnap.empty) {
                const subData = subSnap.docs[0].data();
                userData.subscription = {
                  status: subData.status,
                  planId: subData.planId,
                  currentPeriodEnd: subData.currentPeriodEnd
                };
              }
            } catch (err) {
              console.warn('Failed to fetch subscriptions:', err);
            }

            setProfile(userData);
          } else {
            // Create profile if it doesn't exist
            const role = firebaseUser.email === 'yousseflaaroui1@gmail.com' 
              ? 'admin' 
              : (pendingRole || 'student');

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: role as 'student' | 'teacher' | 'admin',
              createdAt: new Date().toISOString(),
              xp: 0,
              streak: 0,
              lastActive: new Date().toISOString(),
              preferences: {
                darkMode: false,
                dyslexicFont: false,
              },
            };
            
            try {
              await setDoc(userDocRef, newProfile);
              setProfile(newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
          }
          setLoading(false);
        }, (error) => {
          // Only handle error if user is still logged in
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pendingRole]);

  const signIn = async (role?: 'student' | 'teacher') => {
    try {
      if (role) setPendingRole(role);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const awardXP = async (amount: number) => {
    if (!user || !profile) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = profile.lastActive ? profile.lastActive.split('T')[0] : null;
    
    let newStreak = profile.streak || 0;
    
    if (lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newXp = (profile.xp || 0) + amount;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        xp: newXp,
        streak: newStreak,
        lastActive: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, awardXP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
