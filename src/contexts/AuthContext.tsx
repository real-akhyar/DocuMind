import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  // CHANGE: Rename isAdmin to isModerator for clarity
  isModerator: boolean;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// CHANGE: Rename to reflect the new role
const MODERATOR_EMAILS = [
  "akhyarahmad919@gmail.com",
  "ansuthisis789@gmail.com"
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // CHANGE: Rename isAdmin state to isModerator
  const [isModerator, setIsModerator] = useState(false);

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password).then(() => { });
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password).then(() => { });
  };

  const logout = () => {
    return firebaseSignOut(auth);
  };

  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider).then(() => { });
  };

  const getToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // CHANGE: Check if user is a moderator
      if (user && user.email && MODERATOR_EMAILS.includes(user.email)) {
        setIsModerator(true);
      } else {
        setIsModerator(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    getToken,
    // CHANGE: Pass isModerator in the context value
    isModerator,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
