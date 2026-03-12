import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { authService } from '../services/api';
import { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const usuarioDoc = await getDoc(doc(db, 'usuarios', fbUser.uid));
          if (usuarioDoc.exists()) {
            const userData = usuarioDoc.data() as Usuario;
            const fullUser = { ...userData, uid: fbUser.uid };
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
          } else {
            const defaultUser: Usuario = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              nombre: fbUser.displayName || '',
              rol: 'guardia',
              empresaId: '',
              estado: 'activo',
              documentos: {}
            };
            setUser(defaultUser);
            localStorage.setItem('user', JSON.stringify(defaultUser));
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.data?.user) {
      setUser(result.data.user);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
