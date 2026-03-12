# Guardia Management System

Plataforma web progresiva (PWA) para la gestión de empresas de seguridad privada en Ecuador.

## Características

- ✅ Multi-empresa con datos aislados por empresa
- ✅ Gestión de empleados (guardias, supervisores, administradores)
- ✅ Gestión de turnos y sitios de trabajo
- ✅ Reportes con firma digital
- ✅ Solicitudes de permisos
- ✅ Mapa interactivo con ubicación de sitios
- ✅ PWA - Instalable en dispositivos móviles
- ✅ Notificaciones en tiempo real (Firebase)
- ✅ Interfaz responsive

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: Firebase Firestore
- **Auth**: Firebase Authentication
- **PWA**: Vite PWA Plugin

## Estructura del Proyecto

```
SAS/
├── backend/          # Servidor API (Node.js + Express + Firebase)
├── frontend/        # Aplicación web (React + Vite + PWA)
├── firebase.json    # Configuración Firebase Hosting
└── railway.json     # Configuración Railway
```

---

## Desarrollo Local

### Prerrequisitos

- Node.js 18+
- npm instalado

### Paso 1: Backend

```bash
# En la raíz del proyecto
cd backend
npm install
npm run dev
```

El backend correra en: `http://localhost:3001`

### Paso 2: Frontend

Abre una nueva terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend correra en: `http://localhost:5173`

**Nota:** El frontend usa un proxy, las peticiones a `/api` se redirigen automaticamente al backend (no necesitas cambiar el .env en desarrollo).

---

## Produccion

### Backend - Railway

**1. Crear proyecto en Railway:**

1. Ve a https://railway.com
2. Inicia sesion con tu cuenta de GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Selecciona el repositorio `NXSjavier/guardia`

**2. Configuracion del servicio:**

En la pagina del servicio en Railway, configura:

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm run build` |
| Start Command | `node dist/index.js` |

**3. Agregar variables de entorno:**

En la seccion **Variables** del servicio, agrega:

```
FIREBASE_PROJECT_ID = studio-243920639-72d26
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@studio-243920639-72d26.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = (ver instruccion abajo)
JWT_SECRET = guardia-management-secret-key-2024
NODE_ENV = production
PORT = 8080
```

**Para obtener FIREBASE_PRIVATE_KEY:**

1. Ve a https://console.firebase.google.com/project/studio-243920639-72d26/settings/serviceaccounts
2. Click **Generate new private key**
3. Se descargara un archivo JSON
4. Abre el archivo y copia el valor de `"private_key"` (todo el texto entre comillas)
5. Pega ese valor en Railway como `FIREBASE_PRIVATE_KEY`

**4. Generar dominio:**

En Railway, busca el boton **Generate Domain** y haz click.
Te dara una URL como: `https://guardia-production.up.railway.app`

**5. Redeploy:**

Despues de guardar las variables, Railway hara redeploy automaticamente.

---

### Frontend - Firebase Hosting

**1. Actualizar URL del backend:**

Edita el archivo `frontend/.env`:

```env
VITE_API_URL=https://guardia-production.up.railway.app
```

(Reemplaza con tu dominio de Railway)

**2. Build y deploy:**

```bash
cd frontend
npm run build
npx firebase deploy --project studio-243920639-72d26
```

---

## Actualizar despues de cambios

### Si cambias el backend:

```bash
git add .
git commit -m "descripcion del cambio"
git push origin main
```

Railway detectara los cambios y hara redeploy automaticamente.

### Si cambias el frontend:

```bash
cd frontend
npm run build
npx firebase deploy --project studio-243920639-72d26
```

---

## URLs de Produccion

- **Frontend:** https://studio-243920639-72d26.web.app
- **Backend:** https://guardia-production.up.railway.app

---

## Rutas de la API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/registrar` | Registrar usuario |
| GET | `/api/empresas` | Listar empresas |
| POST | `/api/empresas` | Crear empresa |
| GET | `/api/empleados/:empresaId` | Listar empleados |
| POST | `/api/empleados` | Crear empleado |
| GET | `/api/sitios/:empresaId` | Listar sitios |
| POST | `/api/sitios` | Crear sitio |
| GET | `/api/turnos/:empresaId` | Listar turnos |
| POST | `/api/turnos` | Crear turno |
| GET | `/api/reportes/:empresaId` | Listar reportes |
| POST | `/api/reportes` | Crear reporte |
| GET | `/api/permisos/:empresaId` | Listar permisos |
| POST | `/api/permisos` | Crear permiso |

---

## Configuracion de Firebase (referencia)

1. Crea un proyecto en https://console.firebase.google.com
2. Habilita **Authentication** (Email/Password)
3. Crea una base de datos **Firestore** (modo de prueba)
4. Descarga las credenciales de servicio (Service Account)
5. Configura las variables de entorno

---

## Licencia

ISC
