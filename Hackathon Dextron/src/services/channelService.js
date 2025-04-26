const Channel = require('../models/Channel');
const Role = require('../models/Role');
const User = require('../models/User');
const logger = require('../utils/logger');

class ChannelService {
  async createChannel(channelData) {
    try {
      const channel = new Channel(channelData);
      await channel.save();
      return channel;
    } catch (error) {
      logger.error('Error creating channel:', error);
      throw error;
    }
  }

  async getChannel(channelId) {
    try {
      const channel = await Channel.findById(channelId)
        .populate('allowedRoles')
        .populate('allowedUsers', 'username')
        .populate('createdBy', 'username');

      if (!channel) {
        throw new Error('Channel not found');
      }

      return channel;
    } catch (error) {
      logger.error('Error getting channel:', error);
      throw error;
    }
  }

  async updateChannel(channelId, updateData) {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      Object.assign(channel, updateData);
      await channel.save();

      return channel;
    } catch (error) {
      logger.error('Error updating channel:', error);
      throw error;
    }
  }

  async deleteChannel(channelId) {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      await channel.remove();
      return true;
    } catch (error) {
      logger.error('Error deleting channel:', error);
      throw error;
    }
  }

  async addAllowedRole(channelId, roleId) {
    try {
      const [channel, role] = await Promise.all([
        Channel.findById(channelId),
        Role.findById(roleId)
      ]);

      if (!channel || !role) {
        throw new Error('Channel or Role not found');
      }

      channel.addAllowedRole(roleId);
      await channel.save();

      return channel;
    } catch (error) {
      logger.error('Error adding allowed role:', error);
      throw error;
    }
  }

  async removeAllowedRole(channelId, roleId) {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      channel.removeAllowedRole(roleId);
      await channel.save();

      return channel;
    } catch (error) {
      logger.error('Error removing allowed role:', error);
      throw error;
    }
  }

  async addAllowedUser(channelId, userId) {
    try {
      const [channel, user] = await Promise.all([
        Channel.findById(channelId),
        User.findById(userId)
      ]);

      if (!channel || !user) {
        throw new Error('Channel or User not found');
      }

      if (!channel.allowedUsers.includes(userId)) {
        channel.allowedUsers.push(userId);
        await channel.save();
      }

      return channel;
    } catch (error) {
      logger.error('Error adding allowed user:', error);
      throw error;
    }
  }

  async removeAllowedUser(channelId, userId) {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      channel.allowedUsers = channel.allowedUsers.filter(
        id => id.toString() !== userId.toString()
      );
      await channel.save();

      return channel;
    } catch (error) {
      logger.error('Error removing allowed user:', error);
      throw error;
    }
  }

  async getChannelsByCategory(category) {
    try {
      return await Channel.find({ category })
        .populate('allowedRoles')
        .sort({ name: 1 });
    } catch (error) {
      logger.error('Error getting channels by category:', error);
      throw error;
    }
  }

  async getAllChannels() {
    try {
      return await Channel.find()
        .populate('allowedRoles')
        .sort({ category: 1, name: 1 });
    } catch (error) {
      logger.error('Error getting all channels:', error);
      throw error;
    }
  }

  async updateChannelSettings(channelId, settings) {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw new Error('Channel not found');
      }

      channel.settings = { ...channel.settings, ...settings };
      await channel.save();

      return channel;
    } catch (error) {
      logger.error('Error updating channel settings:', error);
      throw error;
    }
  }

  async checkUserAccess(channelId, userId) {
    try {
      const [channel, user] = await Promise.all([
        Channel.findById(channelId),
        User.findById(userId)
      ]);

      if (!channel || !user) {
        throw new Error('Channel or User not found');
      }

      return channel.canAccess(userId, user.roles);
    } catch (error) {
      logger.error('Error checking user access:', error);
      throw error;
    }
  }
}

module.exports = new ChannelService();