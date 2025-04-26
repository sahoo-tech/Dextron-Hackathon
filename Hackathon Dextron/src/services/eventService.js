const Event = require('../models/Event');
const User = require('../models/User');
const logger = require('../utils/logger');

class EventService {
  async createEvent(eventData, organizerId) {
    try {
      const event = new Event({
        ...eventData,
        organizer: organizerId
      });

      await event.save();
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async getEvent(eventId) {
    try {
      const event = await Event.findById(eventId)
        .populate('organizer', 'username')
        .populate('participants.user', 'username');

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      logger.error('Error getting event:', error);
      throw error;
    }
  }

  async updateEvent(eventId, updateData, userId) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update event');
      }

      Object.assign(event, updateData);
      await event.save();

      return event;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete event');
      }

      await event.remove();
      return true;
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }

  async addParticipant(eventId, userId, status = 'attending') {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      event.addParticipant(userId, status);
      await event.save();

      return event;
    } catch (error) {
      logger.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(eventId, userId) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      event.participants = event.participants.filter(
        p => p.user.toString() !== userId.toString()
      );

      await event.save();
      return event;
    } catch (error) {
      logger.error('Error removing participant:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit = 10) {
    try {
      const events = await Event.find({
        startDate: { $gte: new Date() },
        status: { $ne: 'cancelled' }
      })
        .sort({ startDate: 1 })
        .limit(limit)
        .populate('organizer', 'username');

      return events;
    } catch (error) {
      logger.error('Error getting upcoming events:', error);
      throw error;
    }
  }

  async getUserEvents(userId) {
    try {
      const events = await Event.find({
        $or: [
          { organizer: userId },
          { 'participants.user': userId }
        ]
      })
        .populate('organizer', 'username')
        .sort({ startDate: -1 });

      return events;
    } catch (error) {
      logger.error('Error getting user events:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId, status, userId) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update event status');
      }

      event.status = status;
      await event.save();

      return event;
    } catch (error) {
      logger.error('Error updating event status:', error);
      throw error;
    }
  }
}

module.exports = new EventService();