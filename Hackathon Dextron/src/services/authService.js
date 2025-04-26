const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
  }

  async registerUser(userData) {
    try {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { discordId: userData.discordId }]
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = new User(userData);
      await user.save();

      return this.generateToken(user);
    } catch (error) {
      logger.error('Error in user registration:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      user.lastLogin = new Date();
      await user.save();

      return this.generateToken(user);
    } catch (error) {
      logger.error('Error in user login:', error);
      throw error;
    }
  }

  generateToken(user) {
    const payload = {
      userId: user._id,
      discordId: user.discordId,
      roles: user.roles
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }
  }

  async getUserFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return await User.findById(decoded.userId);
    } catch (error) {
      logger.error('Error getting user from token:', error);
      throw error;
    }
  }

  async updateUserRoles(userId, roles) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.roles = roles;
      await user.save();

      return this.generateToken(user);
    } catch (error) {
      logger.error('Error updating user roles:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = false;
      await user.save();

      return true;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();