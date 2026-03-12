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

## Requisitos

- Node.js 18+
- NPM o Yarn
- Cuenta de Firebase (Firestore, Auth, Messaging)

## Instalación

### 1. Clonar el proyecto

```bash
cd SAS
```

### 2. Configurar Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de Firebase Admin
npm install
```

### 3. Configurar Frontend

```bash
cd frontend
cp .env.example .env
# Edita .env con tus credenciales de Firebase
npm install
```

### 4. Ejecutar

Desarrollo (ambos):

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

> ⚠️ **HTTPS en desarrollo**
>
> La PWA sólo se puede instalar desde una conexión segura. Vite se puede
> iniciar en HTTPS usando un certificado autofirmado (las advertencias del
> navegador son normales) o con un certificado válido generado con
> [mkcert](https://github.com/FiloSottile/mkcert):
>
> ```bash
> cd frontend
> mkcert -install
> mkcert localhost 127.0.0.1 ::1
> # exporta las rutas al entorno antes de ejecutar npm run dev
> export SSL_CRT_FILE="$(pwd)/localhost+2.pem"
> export SSL_KEY_FILE="$(pwd)/localhost+2-key.pem"
> npm run dev
> ```
>
> Alternativamente, puedes usar un túnel HTTPS (ngrok, Cloudflare Tunnel, etc.)
> apuntando al servidor local HTTP; el túnel gestionará TLS por ti.


Producción:

```bash
cd backend
npm run build
npm start

cd frontend
npm run build
npm run preview
```

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita **Authentication** (Email/Password)
3. Crea una base de datos **Firestore** ( modo de prueba )
4. Habilita **Firebase Messaging** (opcional para notificaciones push)
5. Descarga las credenciales de servicio (Service Account)
6. Configura las variables de entorno

## Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── config/       # Configuración Firebase
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/  # Auth middleware
│   │   ├── models/       # Tipos TypeScript
│   │   ├── routes/       # Rutas API
│   │   └── index.ts      # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── context/     # React Context
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API services
│   │   ├── types/       # Tipos TypeScript
│   │   └── App.tsx      # Main app
│   └── package.json
│
└── README.md
```

## Licencia

ISC
