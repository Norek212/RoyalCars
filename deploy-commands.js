const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`[DEPLOY] Rejestrowanie ${commands.length} komend...`);

    // Rejestracja globalna (działa na wszystkich serwerach po ~1h)
    // await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    // Rejestracja na konkretnym serwerze (od razu aktywna)
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('[DEPLOY] ✅ Komendy zarejestrowane pomyślnie!');
  } catch (error) {
    console.error('[DEPLOY] ❌ Błąd podczas rejestrowania komend:', error);
  }
})();
