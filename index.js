const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─── Kolekcja komend ───────────────────────────────────────────────────────────
client.commands = new Collection();

// ─── Kolekcja sesji embed (userId => { channelId, messageId, data }) ──────────
client.embedSessions = new Collection();

// ─── Ładowanie komend ──────────────────────────────────────────────────────────
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`[COMMANDS] Załadowano komendę: /${command.data.name}`);
  }
}

// ─── Ładowanie eventów ─────────────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`[EVENTS] Załadowano event: ${event.name} (${file})`);
}

// ─── Obsługa komend slash ──────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[ERROR] Błąd podczas wykonywania komendy /${interaction.commandName}:`, error);
    const msg = { content: '❌ Wystąpił błąd podczas wykonywania tej komendy.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

// ─── Ready event ───────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`[BOT] Zalogowano jako ${client.user.tag}`);
  console.log(`[BOT] Serwery: ${client.guilds.cache.size}`);
});

client.login(process.env.TOKEN);
