const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');
const logger = require('../utils/logger');

class MessageService {
  async createMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      return message;
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessage(messageId) {
    try {
      const message = await Message.findById(messageId)
        .populate('author', 'username')
        .populate('mentions', 'username')
        .populate('channelId');

      if (!message) {
        throw new Error('Message not found');
      }

      return message;
    } catch (error) {
      logger.error('Error getting message:', error);
      throw error;
    }
  }

  async updateMessage(messageId, content, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to edit message');
      }

      message.edit(content);
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete message');
      }

      await message.remove();
      return true;
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  async addReaction(messageId, emoji, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      message.addReaction(emoji, userId);
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId, emoji, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      message.removeReaction(emoji, userId);
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error removing reaction:', error);
      throw error;
    }
  }

  async getChannelMessages(channelId, limit = 50, before = null) {
    try {
      let query = { channelId };
      if (before) {
        query.createdAt = { $lt: before };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'username')
        .populate('mentions', 'username');

      return messages;
    } catch (error) {
      logger.error('Error getting channel messages:', error);
      throw error;
    }
  }

  async pinMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      message.isPinned = true;
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error pinning message:', error);
      throw error;
    }
  }

  async unpinMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      message.isPinned = false;
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error unpinning message:', error);
      throw error;
    }
  }

  async getPinnedMessages(channelId) {
    try {
      return await Message.find({
        channelId,
        isPinned: true
      })
        .sort({ createdAt: -1 })
        .populate('author', 'username')
        .populate('mentions', 'username');
    } catch (error) {
      logger.error('Error getting pinned messages:', error);
      throw error;
    }
  }

  async searchMessages(query, channelId = null) {
    try {
      let searchQuery = {
        content: { $regex: query, $options: 'i' }
      };

      if (channelId) {
        searchQuery.channelId = channelId;
      }

      return await Message.find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('author', 'username')
        .populate('channelId');
    } catch (error) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }
}

module.exports = new MessageService();