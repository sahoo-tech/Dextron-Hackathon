const Role = require('../models/Role');
const User = require('../models/User');
const logger = require('../utils/logger');

class RoleService {
  async createRole(roleData) {
    try {
      const existingRole = await Role.findOne({ name: roleData.name });

      if (existingRole) {
        throw new Error('Role already exists');
      }

      const role = new Role(roleData);
      await role.save();

      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  async getRole(roleId) {
    try {
      const role = await Role.findById(roleId);

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      logger.error('Error getting role:', error);
      throw error;
    }
  }

  async updateRole(roleId, updateData) {
    try {
      const role = await Role.findById(roleId);

      if (!role) {
        throw new Error('Role not found');
      }

      Object.assign(role, updateData);
      await role.save();

      return role;
    } catch (error) {
      logger.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      const role = await Role.findById(roleId);

      if (!role) {
        throw new Error('Role not found');
      }

      // Check if any users have this role
      const usersWithRole = await User.find({ roles: roleId });
      if (usersWithRole.length > 0) {
        throw new Error('Cannot delete role: Role is assigned to users');
      }

      await role.remove();
      return true;
    } catch (error) {
      logger.error('Error deleting role:', error);
      throw error;
    }
  }

  async assignRoleToUser(userId, roleId) {
    try {
      const [user, role] = await Promise.all([
        User.findById(userId),
        Role.findById(roleId)
      ]);

      if (!user || !role) {
        throw new Error('User or Role not found');
      }

      if (!user.roles.includes(role.name)) {
        user.roles.push(role.name);
        await user.save();
      }

      return user;
    } catch (error) {
      logger.error('Error assigning role to user:', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId, roleId) {
    try {
      const [user, role] = await Promise.all([
        User.findById(userId),
        Role.findById(roleId)
      ]);

      if (!user || !role) {
        throw new Error('User or Role not found');
      }

      user.roles = user.roles.filter(r => r !== role.name);
      await user.save();

      return user;
    } catch (error) {
      logger.error('Error removing role from user:', error);
      throw error;
    }
  }

  async getUserRoles(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const roles = await Role.find({ name: { $in: user.roles } });
      return roles;
    } catch (error) {
      logger.error('Error getting user roles:', error);
      throw error;
    }
  }

  async getAllRoles() {
    try {
      return await Role.find().sort({ level: 1 });
    } catch (error) {
      logger.error('Error getting all roles:', error);
      throw error;
    }
  }

  async hasPermission(userId, permission) {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.some(role => role.hasPermission(permission));
    } catch (error) {
      logger.error('Error checking permission:', error);
      throw error;
    }
  }
}

module.exports = new RoleService();