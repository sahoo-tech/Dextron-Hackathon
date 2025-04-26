const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.commandsPath = path.join(__dirname, '../commands');
  }

  async loadCommands() {
    const commandFiles = fs.readdirSync(this.commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
      try {
        const command = require(path.join(this.commandsPath, file));
        if ('data' in command && 'execute' in command) {
          this.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          logger.info(`Loaded command: ${command.data.name}`);
        } else {
          logger.warn(`Command at ${file} is missing required properties`);
        }
      } catch (error) {
        logger.error(`Error loading command from ${file}:`, error);
      }
    }

    return commands;
  }

  async registerCommands() {
    try {
      const commands = await this.loadCommands();
      const rest = new REST().setToken(process.env.DISCORD_TOKEN);

      logger.info('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );

      logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
      logger.error('Error registering commands:', error);
    }
  }

  async handleInteraction(interaction) {
    if (!interaction.isCommand()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`Command ${interaction.commandName} not found`);
      return;
    }

    try {
      await command.execute(interaction);
      logger.info(`Command ${interaction.commandName} executed successfully`);
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}:`, error);
      const errorMessage = 'There was an error executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  hasCommand(name) {
    return this.commands.has(name);
  }
}

module.exports = CommandHandler;