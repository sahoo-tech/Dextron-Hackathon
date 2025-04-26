require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize collections
client.commands = new Collection();
client.events = new Collection();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Event handler
client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}`);
});

client.on('error', error => {
  logger.error('Discord client error:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing...');
  client.destroy();
  mongoose.connection.close();
  process.exit(0);
});