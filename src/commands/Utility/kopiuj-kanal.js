import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType, AttachmentBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export default {
  data: new SlashCommandBuilder()
    .setName('kopiuj-kanal')
    .setDescription('Kopiuje wiadomości z kanału i wysyła je na inny kanał')
    .addChannelOption((o) =>
      o.setName('źródło').setDescription('Kanał do skopiowania').setRequired(true).addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((o) =>
      o.setName('cel').setDescription('Kanał docelowy').setRequired(true).addChannelTypes(ChannelType.GuildText)
    )
    .addIntegerOption((o) =>
      o.setName('limit').setDescription('Ile wiadomości (domyślnie wszystkie, max 500)').setRequired(false).setMinValue(1).setMaxValue(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, guildConfig, client) {
    const sourceChannel = interaction.options.getChannel('źródło');
    const targetChannel = interaction.options.getChannel('cel');
    const limit = interaction.options.getInteger('limit') ?? 500;

    await interaction.reply({
      content: `⏳ Pobieram wiadomości z ${sourceChannel}...`,
      flags: MessageFlags.Ephemeral,
    });

    // Pobierz wiadomości partiami po 100
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

    // Od najstarszej do najnowszej
    allMessages.reverse();

    await interaction.editReply({
      content: `⏳ Znaleziono **${allMessages.length}** wiadomości. Kopiuję...`,
    });

    let sent = 0;
    let errors = 0;

    for (const msg of allMessages) {
      try {
        if (!msg.content && msg.attachments.size === 0 && msg.embeds.length === 0) continue;

        const attachments = [];

        for (const attachment of msg.attachments.values()) {
          try {
            const buffer = await downloadFile(attachment.url);
            attachments.push(new AttachmentBuilder(buffer, { name: attachment.name }));
          } catch (e) {
            logger.warn(`[kopiuj-kanal] Nie udało się pobrać: ${attachment.name} — ${e.message}`);
            errors++;
          }
        }

        const content = msg.content || null;

        const payload = {};
        if (content) payload.content = content;
        if (attachments.length > 0) payload.files = attachments;
        if (msg.embeds.length > 0) payload.embeds = msg.embeds.slice(0, 10);

        await targetChannel.send(payload);
        sent++;

        await sleep(750);
      } catch (err) {
        logger.error(`[kopiuj-kanal] Błąd przy wiadomości ${msg.id}:`, err.message);
        errors++;
      }
    }

    await interaction.editReply({
      content: `✅ Skopiowano **${sent}** wiadomości na ${targetChannel}.${errors > 0 ? `\n⚠️ Nie udało się: **${errors}** (niedostępne pliki lub błędy)` : ''}`,
    });
  },
};

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    lib.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
