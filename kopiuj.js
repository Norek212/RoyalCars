const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require('discord.js');
const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kopiuj-kanal')
    .setDescription('Kopiuje wszystkie wiadomości z kanału i wysyła je na inny kanał')
    .addChannelOption((o) =>
      o.setName('źródło').setDescription('Kanał do skopiowania').setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName('cel').setDescription('Kanał docelowy').setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName('limit').setDescription('Ile wiadomości skopiować (domyślnie: wszystkie, max 500)').setRequired(false).setMinValue(1).setMaxValue(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const sourceChannel = interaction.options.getChannel('źródło');
    const targetChannel = interaction.options.getChannel('cel');
    const limit = interaction.options.getInteger('limit') || 500;

    await interaction.reply({
      content: `⏳ Pobieram wiadomości z ${sourceChannel}...`,
      ephemeral: true,
    });

    // Pobierz wiadomości (Discord zwraca max 100 na raz, więc robimy pętle)
    let allMessages = [];
    let lastId = null;

    while (allMessages.length < limit) {
      const fetchLimit = Math.min(100, limit - allMessages.length);
      const options = { limit: fetchLimit };
      if (lastId) options.before = lastId;

      const batch = await sourceChannel.messages.fetch(options);
      if (batch.size === 0) break;

      allMessages.push(...batch.values());
      lastId = batch.last().id;

      if (batch.size < fetchLimit) break;
    }

    // Odwróć kolejność (od najstarszej do najnowszej)
    allMessages.reverse();

    await interaction.editReply({
      content: `⏳ Znaleziono **${allMessages.length}** wiadomości. Kopiuję...`,
    });

    let sent = 0;
    let errors = 0;

    for (const msg of allMessages) {
      try {
        // Pomiń wiadomości systemowe i puste bez załączników
        if (!msg.content && msg.attachments.size === 0 && msg.embeds.length === 0) continue;

        const attachments = [];

        // Pobierz pliki i obrazki jako AttachmentBuilder
        for (const attachment of msg.attachments.values()) {
          try {
            const buffer = await downloadFile(attachment.url);
            const file = new AttachmentBuilder(buffer, { name: attachment.name });
            attachments.push(file);
          } catch (e) {
            console.error(`[COPY] Nie udało się pobrać załącznika: ${attachment.url}`, e.message);
            errors++;
          }
        }

        // Zbuduj nagłówek z info o autorze (webhookowy styl)
        const authorLine = `**${msg.author.username}** • <t:${Math.floor(msg.createdTimestamp / 1000)}:f>`;
        const content = msg.content ? `${authorLine}\n${msg.content}` : authorLine;

        // Wyślij wiadomość
        const payload = { content };
        if (attachments.length > 0) payload.files = attachments;

        // Jeśli oryginał miał embed, dołącz go też
        if (msg.embeds.length > 0) {
          payload.embeds = msg.embeds.slice(0, 10); // max 10 embedów
        }

        await targetChannel.send(payload);
        sent++;

        // Małe opóźnienie żeby nie trafić w rate limit
        await sleep(700);
      } catch (err) {
        console.error(`[COPY] Błąd przy wiadomości ${msg.id}:`, err.message);
        errors++;
      }
    }

    await interaction.editReply({
      content: `✅ Gotowe! Skopiowano **${sent}** wiadomości na ${targetChannel}.${errors > 0 ? `\n⚠️ Błędy: **${errors}** (np. niedostępne pliki)` : ''}`,
    });
  },
};

// ─── Pobierz plik jako Buffer ──────────────────────────────────────────────────
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;

    lib.get(url, { timeout: 15000 }, (res) => {
      // Obsługa redirectów
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

// ─── Sleep helper ──────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
