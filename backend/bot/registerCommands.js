// Run ONCE after any command changes:
// node bot/registerCommands.js

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const commands = [
  new SlashCommandBuilder()
    .setName('save')
    .setDescription('Save a link to LinVault')
    .addStringOption(opt =>
      opt.setName('url')
        .setDescription('The URL to save (paste the full https:// link)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('collection')
        .setDescription('Collection to save into (leave empty for Unsorted)')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(opt =>
      opt.setName('tags')
        .setDescription('Tags to add — pick from your existing tags or type new ones (comma separated)')
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
