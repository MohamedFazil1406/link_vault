// Run this ONCE to register slash commands with Discord:
// node bot/registerCommands.js

import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';

const commands = [
  new SlashCommandBuilder()
    .setName('save')
    .setDescription('Save a link to LinVault')
    .addStringOption(opt =>
      opt.setName('url')
        .setDescription('The URL to save')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('collection')
        .setDescription('Collection to save into (leave empty for Unsorted)')
        .setRequired(false)
        .setAutocomplete(true)
    ),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Registering slash commands...');
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered!');
} catch (err) {
  console.error('❌ Failed to register commands:', err);
}
