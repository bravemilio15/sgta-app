import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { obtenerUsuarioPorUid } from '../api';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

type UserType = {
  uid: string;
  correo: string;
  tipo: string;
  [key: string]: any;
} | null;

type UserContextType = {
  user: UserType;
  setUser: (user: UserType) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si usas Firebase Auth:
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Obtén los datos del backend
        const datos = await obtenerUsuarioPorUid(firebaseUser.uid);
        setUser({ uid: firebaseUser.uid, correo: firebaseUser.email || '', tipo: datos.tipo, ...datos });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
