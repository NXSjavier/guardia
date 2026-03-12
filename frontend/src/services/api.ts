import axios from 'axios';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  getIdToken
} from 'firebase/auth';
import { db, auth } from './firebase';

const API_URL = ''; // No longer used

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const EMPRESAS = 'empresas';
const USUARIOS = 'usuarios';
const EMPLEADOS = 'empleados';
const SITIOS = 'sitios';
const TURNOS = 'turnos';
const REPORTES = 'reportes';
const PERMISOS = 'permisos';
const NOTIFICACIONES = 'notificaciones';
const ASISTENCIAS = 'asistencias';

// Auth
export const authService = {
  registrar: async (data: any) => {
    const { email, password, nombre } = data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: nombre });
    
    await addDoc(collection(db, USUARIOS), {
      uid: userCredential.user.uid,
      email,
      nombre,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { data: { user: userCredential.user } };
  },
  
  login: async (data: any) => {
    const { email, password } = data;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(userCredential.user);
    
    const usuarioDoc = await getDoc(doc(db, USUARIOS, userCredential.user.uid));
    const usuarioData = usuarioDoc.exists() ? usuarioDoc.data() : {};
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ ...usuarioData, uid: userCredential.user.uid }));
    
    return { data: { token, user: { uid: userCredential.user.uid, ...usuarioData } } };
  },
  
  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  onAuthChange: (callback: any) => onAuthStateChanged(auth, callback),
  
  resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
  
  getCurrentUser: () => auth.currentUser,
  
  obtenerPerfil: async (uid: string) => {
    const docSnap = await getDoc(doc(db, USUARIOS, uid));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  actualizarPerfil: async (uid: string, data: any) => {
    await updateDoc(doc(db, USUARIOS, uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Perfil actualizado' } };
  },
  
  actualizarFcmToken: async (uid: string, fcmToken: string) => {
    await updateDoc(doc(db, USUARIOS, uid), { fcmToken });
    return { data: { message: 'Token actualizado' } };
  }
};

// Empresas
export const empresaService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, EMPRESAS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async () => {
    const q = query(collection(db, EMPRESAS), orderBy('nombre'));
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, EMPRESAS, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  actualizar: async (id: string, data: any) => {
    await updateDoc(doc(db, EMPRESAS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Empresa actualizada' } };
  },
  
  eliminar: async (id: string) => {
    await deleteDoc(doc(db, EMPRESAS, id));
    return { data: { message: 'Empresa eliminada' } };
  },
  
  subscribe: (callback: any) => {
    return onSnapshot(query(collection(db, EMPRESAS), orderBy('nombre')), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Empleados
export const empleadoService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, EMPLEADOS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string, params?: any) => {
    let q: any = query(
      collection(db, EMPLEADOS), 
      where('empresaId', '==', empresaId)
    );
    try {
      if (params?.rol) {
        q = query(collection(db, EMPLEADOS), where('empresaId', '==', empresaId), where('rol', '==', params.rol));
      } else if (params?.estado) {
        q = query(collection(db, EMPLEADOS), where('empresaId', '==', empresaId), where('estado', '==', params.estado));
      } else {
        q = query(collection(db, EMPLEADOS), where('empresaId', '==', empresaId), orderBy('nombre'));
      }
    } catch(e) {
      q = query(collection(db, EMPLEADOS), where('empresaId', '==', empresaId));
    }
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, EMPLEADOS, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  actualizar: async (id: string, data: any) => {
    await updateDoc(doc(db, EMPLEADOS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Empleado actualizado' } };
  },
  
  eliminar: async (id: string) => {
    await deleteDoc(doc(db, EMPLEADOS, id));
    return { data: { message: 'Empleado eliminado' } };
  },
  
  cambiarEstado: async (id: string, estado: string) => {
    await updateDoc(doc(db, EMPLEADOS, id), { estado });
    return { data: { message: 'Estado actualizado' } };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, EMPLEADOS), 
      where('empresaId', '==', empresaId),
      orderBy('nombre')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Sitios
export const sitioService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, SITIOS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string) => {
    const q = query(
      collection(db, SITIOS), 
      where('empresaId', '==', empresaId),
      orderBy('nombre')
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, SITIOS, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  actualizar: async (id: string, data: any) => {
    await updateDoc(doc(db, SITIOS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Sitio actualizado' } };
  },
  
  eliminar: async (id: string) => {
    await deleteDoc(doc(db, SITIOS, id));
    return { data: { message: 'Sitio eliminado' } };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, SITIOS), 
      where('empresaId', '==', empresaId),
      orderBy('nombre')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Turnos
export const turnoService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, TURNOS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string) => {
    const q = query(
      collection(db, TURNOS), 
      where('empresaId', '==', empresaId),
      orderBy('fecha', 'desc')
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerDelDia: async (empresaId: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const q = query(
      collection(db, TURNOS), 
      where('empresaId', '==', empresaId),
      where('fecha', '>=', Timestamp.fromDate(hoy)),
      where('fecha', '<', Timestamp.fromDate(manana))
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, TURNOS, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  actualizar: async (id: string, data: any) => {
    await updateDoc(doc(db, TURNOS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Turno actualizado' } };
  },
  
  cambiarEstado: async (id: string, estado: string) => {
    await updateDoc(doc(db, TURNOS, id), { estado });
    return { data: { message: 'Estado actualizado' } };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, TURNOS), 
      where('empresaId', '==', empresaId),
      orderBy('fecha', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Reportes
export const reporteService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, REPORTES), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string) => {
    const q = query(
      collection(db, REPORTES), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerDelEmpleado: async (empleadoId: string, limite: number = 10) => {
    const q = query(
      collection(db, REPORTES), 
      where('empleadoId', '==', empleadoId),
      orderBy('createdAt', 'desc'),
      limit(limite)
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, REPORTES, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, REPORTES), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Permisos
export const permisoService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, PERMISOS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string) => {
    const q = query(
      collection(db, PERMISOS), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  obtenerPorId: async (id: string) => {
    const docSnap = await getDoc(doc(db, PERMISOS, id));
    return { data: docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null };
  },
  
  aprobar: async (id: string, data: any) => {
    await updateDoc(doc(db, PERMISOS, id), {
      ...data,
      estado: 'aprobado',
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Permiso aprobado' } };
  },
  
  rechazar: async (id: string, data: any) => {
    await updateDoc(doc(db, PERMISOS, id), {
      ...data,
      estado: 'rechazado',
      updatedAt: serverTimestamp()
    });
    return { data: { message: 'Permiso rechazado' } };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, PERMISOS), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Notificaciones
export const notificacionService = {
  crear: async (data: any) => {
    const docRef = await addDoc(collection(db, NOTIFICACIONES), {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerTodos: async (empresaId: string) => {
    const q = query(
      collection(db, NOTIFICACIONES), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  marcarLeida: async (id: string) => {
    await updateDoc(doc(db, NOTIFICACIONES, id), { read: true });
    return { data: { message: 'Notificación marcada como leída' } };
  },
  
  marcarTodasLeidas: async (empresaId: string) => {
    const q = query(collection(db, NOTIFICACIONES), where('empresaId', '==', empresaId));
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(d => updateDoc(doc(db, NOTIFICACIONES, d.id), { read: true }));
    await Promise.all(batch);
    return { data: { message: 'Todas marcadas como leídas' } };
  },
  
  subscribe: (empresaId: string, callback: any) => {
    const q = query(
      collection(db, NOTIFICACIONES), 
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

// Asistencias
export const asistenciaService = {
  registrarEntrada: async (empleadoId: string, data: { lat: number; lng: number }) => {
    const docRef = await addDoc(collection(db, ASISTENCIAS), {
      empleadoId,
      tipo: 'entrada',
      ...data,
      fecha: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  registrarSalida: async (empleadoId: string, data: { lat: number; lng: number }) => {
    const docRef = await addDoc(collection(db, ASISTENCIAS), {
      empleadoId,
      tipo: 'salida',
      ...data,
      fecha: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return { data: { id: docRef.id } };
  },
  
  obtenerDelDia: async (empresaId: string) => {
    const q = query(collection(db, ASISTENCIAS), where('empresaId', '==', empresaId));
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
  },
  
  subscribe: (empleadoId: string, callback: any) => {
    const q = query(
      collection(db, ASISTENCIAS), 
      where('empleadoId', '==', empleadoId),
      orderBy('fecha', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};
