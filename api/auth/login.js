const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const APP_SECRET = process.env.AUTH_SECRET || 'dev-secret';

// Credenciales — en producción usa variables de entorno o una base de datos.
const USERS_RAW = [
  { id: '1', name: 'Administrador', email: 'calagaldana@gmail.com', role: 'administrador', password: 'Fede3333', mustChangePassword: false },
  { id: '2', name: 'Responsable', email: 'responsable@club.com', role: 'responsable', password: 'Resp1234', mustChangePassword: true },
  { id: '3', name: 'Técnico', email: 'futgo@gmail.com', role: 'tecnico', password: 'equipotorneo', mustChangePassword: false }
];

// Se hashean una vez al iniciar la función (cold start)
const users = USERS_RAW.map(u => ({ ...u, passwordHash: bcrypt.hashSync(u.password, 10) }));

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Faltan credenciales' });

  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    APP_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword },
    token
  });
};
