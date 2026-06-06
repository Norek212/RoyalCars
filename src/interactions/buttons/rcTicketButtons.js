import { MessageFlags, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';

const CATEGORY_ID = '1505557392593522799';
const LOG_CHANNEL_ID = '1512773364823883909';

async function generateTranscript(channel) {
  const messages = [];
  let lastId = null;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    messages.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }

  messages.reverse();

  const users = new Map();
  for (const msg of messages) {
    const key = msg.author.id;
    users.set(key, { tag: msg.author.username, count: (users.get(key)?.count ?? 0) + 1 });
  }

  const usersInTranscript = [...users.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, u]) => `  ${u.count} - @${u.tag} (${id})`)
    .join('\n');

  const lines = [
    `<Server-Info>`,
    `    Server:   ${channel.guild.name} (${channel.guild.id})`,
    `    Channel:  ${channel.name} (${channel.id})`,
    `    Messages: ${messages.length}`,
    `</Server-Info>`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Users in transcript:`,
    usersInTranscript,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
  ];

  for (const msg of messages) {
    const date = new Date(msg.createdTimestamp).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    lines.push(`[${date}] ${msg.author.username}`);
    if (msg.content) lines.push(`  ${msg.content}`);
    for (const a of msg.attachments.values()) {
      lines.push(`  [Załącznik: ${a.name} — ${a.url}]`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export const rcTicketClose = {
  name: 'rc_ticket_close',
  async execute(interaction, client) {
    const channel = interaction.channel;

    if (channel.parentId !== CATEGORY_ID) {
      return interaction.reply({ content: '❌ To nie jest kanał ticketu.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    try {
      // Generuj transcript
      const transcript = await generateTranscript(channel);
      const fileName = `transcript-${channel.name}.txt`;
      const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: fileName });

      // Wyślij logi
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🔒 Ticket Zamknięty')
          .addFields(
            { name: 'Kanał', value: `${channel.name} (${channel.id})`, inline: true },
            { name: 'Zamknął', value: `${interaction.user} (${interaction.user.id})`, inline: true },
            { name: 'Wiadomości', value: `${transcript.split('\n').filter(l => l.startsWith('[') ).length}`, inline: true },
          )
          .setColor(0xff4141)
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed], files: [attachment] });
      }

      const closeEmbed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closed')
        .setDescription(`Ticket zamknięty przez ${interaction.user}.\nKanał zostanie usunięty za 5 sekund.`)
        .setColor(0xff4141)
        .setTimestamp();

      await interaction.editReply({ embeds: [closeEmbed] });

      setTimeout(async () => {
        try { await channel.delete(); } catch (e) { logger.error('[rcTicket] Błąd usuwania:', e); }
      }, 5000);

    } catch (error) {
      logger.error('[rcTicket] Błąd zamykania ticketu:', error);
      await interaction.editReply({ content: '❌ Wystąpił błąd podczas zamykania ticketu.' });
    }
  },
};

export const rcTicketClaim = {
  name: 'rc_ticket_claim',
  async execute(interaction, client) {
    const channel = interaction.channel;

    if (channel.parentId !== CATEGORY_ID) {
      return interaction.reply({ content: '❌ To nie jest kanał ticketu.', flags: MessageFlags.Ephemeral });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Ticket Claimed')
      .setDescription(`${interaction.user} przejął ten ticket.`)
      .setColor(0xff4141);

    await interaction.reply({ embeds: [embed] });
  },
};

export default [rcTicketClose, rcTicketClaim];
