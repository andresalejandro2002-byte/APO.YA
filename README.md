# 🍗 APO.YA — Coordinación Humanitaria Venezuela

Plataforma de coordinación humanitaria en tiempo real. Conecta a quienes necesitan ayuda con quienes pueden darla.

---

## Estructura del proyecto

```
apoya/
├── index.html        ← App completa (frontend)
├── api/
│   └── claude.js     ← Proxy serverless de Vercel (protege la API key)
├── vercel.json       ← Configuración de rutas y builds
└── README.md
```

---

## Despliegue paso a paso

### 1. GitHub

```bash
# Si tienes Git instalado:
git init
git add .
git commit -m "APO.YA v1 — primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/apoya.git
git push -u origin main
```

O sube los archivos manualmente desde github.com → tu repositorio → "Add file".

### 2. Vercel

1. Ve a **vercel.com** → "Add New Project"
2. Importa el repositorio `apoya` desde GitHub
3. Antes de hacer Deploy, ve a **Environment Variables** y agrega:

```
ANTHROPIC_API_KEY = sk-ant-api03-...  (tu clave real)
```

4. Clic en **Deploy** → en 30 segundos tienes URL pública

### 3. Actualizar el dominio permitido en el proxy

En `api/claude.js`, reemplaza `https://apoya.vercel.app` con tu URL real de Vercel:

```js
const allowedOrigins = [
  'https://TU-PROYECTO.vercel.app',  // ← tu URL real
  'http://localhost:5500',
];
```

---

## Cómo obtener tu API key de Anthropic

1. Ve a **console.anthropic.com**
2. Crea cuenta o inicia sesión
3. API Keys → "Create Key"
4. Copia la clave (empieza con `sk-ant-`)
5. Pégala en Vercel como variable de entorno `ANTHROPIC_API_KEY`

---

## Próximas características (Fase 2)

| Característica | Stack | Estado |
|---|---|---|
| Persistencia de datos (centros reales) | Supabase (Postgres) | ⏳ Pendiente |
| Notificaciones push | Firebase FCM | ⏳ Pendiente |
| Auth / modo admin | Supabase Auth | ⏳ Pendiente |

---

## Seguridad

- La API key de Anthropic **nunca sale al navegador** — vive solo en el servidor de Vercel
- El proxy valida el método HTTP y limita tokens por request (máx. 2000)
- CORS restringido a tu dominio de Vercel

---

*por Venezolanos para Venezuela — AS 2026*
