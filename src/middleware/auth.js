const bcrypt = require('bcryptjs');

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Meezaj Admin"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  if (username !== adminUsername) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD || 'meezaj_admin_2024';
  const valid = hash ? bcrypt.compareSync(password, hash) : password === plain;

  if (!valid) return res.status(403).json({ error: 'Forbidden' });

  req.user = { username, role: 'ADMIN' };
  next();
};

module.exports = basicAuth;
