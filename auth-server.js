const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const APP_SECRET = process.env.AUTH_SECRET || 'dev-secret';
const PORT = process.env.AUTH_PORT || 4000;

// Demo users. In production, use a proper database and never keep plaintext passwords.
let users = [
  { id: '1', name: 'Administrador', email: 'calagaldana@gmail.com', role: 'administrador', password: 'Fede3333', mustChangePassword: false },
  { id: '2', name: 'Responsable', email: 'responsable@club.com', role: 'responsable', password: 'Resp1234', mustChangePassword: true },
  { id: '3', name: 'Técnico', email: 'futgo@gmail.com', role: 'tecnico', password: 'equipotorneo', mustChangePassword: false }
];

// Hash initial passwords on server start (demo only)
users = users.map(u => ({ ...u, passwordHash: bcrypt.hashSync(u.password, 10) }));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Faltan credenciales' });

  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, APP_SECRET, { expiresIn: '8h' });

  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword }, token });
});

app.post('/api/auth/change-password', (req, res) => {
  const { email, newPassword } = req.body || {};
  if (!email || !newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Parámetros inválidos' });

  const userIndex = users.findIndex(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (userIndex < 0) return res.status(404).json({ message: 'Usuario no encontrado' });

  users[userIndex].passwordHash = bcrypt.hashSync(newPassword, 10);
  users[userIndex].mustChangePassword = false;

  return res.json({ message: 'Contraseña actualizada' });
});

app.get('/api/user/me', (req, res) => {
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No autorizado' });
  const token = auth.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, APP_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

app.listen(PORT, () => console.log(`Auth server listening on http://127.0.0.1:${PORT}`));
