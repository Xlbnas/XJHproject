const jwt = require('jsonwebtoken');
require('dotenv').config();

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

module.exports = {
  signToken,
  verifyToken
};