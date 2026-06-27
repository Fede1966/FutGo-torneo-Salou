# Especificación de ejemplo: autenticación

## Endpoint: POST /api/auth/login

- Request body (JSON):

```json
{ "email": "usuario@club.com", "password": "Secret123" }
```

- Respuestas:

200 OK
```json
{
  "user": {
    "id": "uuid-usuario",
    "name": "Nombre Apellido",
    "email": "usuario@club.com",
    "role": "responsable",
    "mustChangePassword": false
  },
  "token": "jwt-token-ejemplo"
}
```

401 Unauthorized — credenciales incorrectas

429 Too Many Requests — demasiados intentos

## Flujo recomendado
- El administrador crea usuarios desde un panel; el servidor envía credenciales temporales por correo.
- En el primer acceso, `mustChangePassword=true` obliga a redirigir al usuario a `/change-password`.
- El backend debe devolver JWT o establecer cookie HttpOnly; el frontend no debe confiar en la seguridad del almacenamiento local.

## Ejemplo de usuarios (secreto, no en producción)

```json
[
  {"email":"admin@club.com","role":"administrador"},
  {"email":"responsable@club.com","role":"responsable"},
  {"email":"tecnico@club.com","role":"tecnico"}
]
```

## Notas de seguridad
- Hashear contraseñas con `bcrypt` o `argon2`.
- Limitar intentos de login (rate limiting / lockout).
- Usar HTTPS en producción y cookies HttpOnly para tokens.
- No permitir enumeración de cuentas.
