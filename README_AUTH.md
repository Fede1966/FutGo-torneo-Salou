# Servidor de autenticación (ejemplo)

Este servidor demo implementa endpoints mínimos para autenticación en desarrollo.

Instalación:

```bash
npm install
```

Instalar sólo dependencias necesarias si no quieres afectar al proyecto principal:

```bash
npm install express cors body-parser jsonwebtoken bcryptjs
```

Ejecutar el servidor:

```bash
npm run auth
```

Por defecto escucha en `http://127.0.0.1:4000`.

Endpoints:
- `POST /api/auth/login` — body: `{ email, password }` → respuesta `{ user, token }`
- `POST /api/auth/change-password` — body: `{ email, newPassword }`
- `GET /api/user/me` — header `Authorization: Bearer <token>`

Notas de seguridad: este servidor es sólo de ejemplo. En producción debes usar una base de datos, políticas de bloqueo, HTTPS y cookies HttpOnly para tokens.
