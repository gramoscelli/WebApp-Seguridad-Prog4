const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Rate limiting para usuario admin
// Map: { username: { attempts: number, blockedUntil: timestamp } }
const loginAttempts = new Map();

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

// Función para limpiar intentos de login (útil para testing)
const clearLoginAttempts = () => {
  loginAttempts.clear();
};

// Rate limiting para prevenir brute force en admin
const login = async (req, res) => {
  const { username, password } = req.body;

  // Verificar rate limiting solo para admin
  if (username === 'admin') {
    const now = Date.now();
    const userAttempts = loginAttempts.get(username) || { attempts: 0, blockedUntil: 0 };

    // Si está bloqueado, verificar si ya pasó el tiempo
    if (userAttempts.blockedUntil > now) {
      const retryAfter = Math.ceil((userAttempts.blockedUntil - now) / 1000); // segundos
      return res.status(429).json({
        error: 'Cuenta bloqueada por múltiples intentos fallidos',
        retryAfter
      });
    }

    // Si ya pasó el tiempo de bloqueo, resetear
    if (userAttempts.blockedUntil > 0 && userAttempts.blockedUntil <= now) {
      loginAttempts.delete(username);
    }
  }

  const query = `SELECT * FROM users WHERE username = ?`;

  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Incrementar intentos fallidos solo para admin
      if (username === 'admin') {
        const userAttempts = loginAttempts.get(username) || { attempts: 0, blockedUntil: 0 };
        userAttempts.attempts += 1;

        if (userAttempts.attempts >= MAX_ATTEMPTS) {
          userAttempts.blockedUntil = Date.now() + BLOCK_DURATION_MS;
        }

        loginAttempts.set(username, userAttempts);
      }

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Login exitoso: resetear intentos para admin
    if (username === 'admin') {
      loginAttempts.delete(username);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'supersecret123'
    );

    res.json({ token, username: user.username });
  });
};

const register = async (req, res) => {
  const { username, password, email } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.query(query, [username, hashedPassword, email], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.json({ message: 'Usuario registrado con éxito' });
  });
};

const verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
    req.session.userId = decoded.id;
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// VULNERABLE: Blind SQL Injection
const checkUsername = (req, res) => {
  const { username } = req.body;
  
  // VULNERABLE: SQL injection que permite inferir información
  const query = `SELECT COUNT(*) as count FROM users WHERE username = '${username}'`;
  
  db.query(query, (err, results) => {
    if (err) {
      // VULNERABLE: Expone errores de SQL
      return res.status(500).json({ error: err.message });
    }
    
    const exists = results[0].count > 0;
    res.json({ exists });
  });
};

module.exports = {
  login,
  register,
  verifyToken,
  checkUsername,
  clearLoginAttempts
};
