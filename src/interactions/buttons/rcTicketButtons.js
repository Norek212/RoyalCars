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
    users.set(msg.author.id, {
      tag: msg.author.username,
      count: (users.get(msg.author.id)?.count ?? 0) + 1,
    });
  }

  const lines = [];

  lines.push(`================================================`);
  lines.push(`  TRANSCRIPT — ${channel.name}`);
  lines.push(`  Serwer:    ${channel.guild.name}`);
  lines.push(`  Kanał ID:  ${channel.id}`);
  lines.push(`  Wiadomości: ${messages.length}`);
  lines.push(`================================================`);
  lines.push(``);
  lines.push(`Uczestnicy:`);
  for (const [, u] of users) {
    lines.push(`  • ${u.tag} (${u.count} wiadomości)`);
  }
  lines.push(``);
  lines.push(`------------------------------------------------`);
  lines.push(``);

  for (const msg of messages) {
    if (msg.author.bot && !msg.content) continue;

    const date = new Date(msg.createdTimestamp).toLocaleString('pl-PL', {
      timeZone: 'Europe/Warsaw',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    if (msg.content) {
      lines.push(`${msg.author.username} [${date}]`);
      lines.push(`  ${msg.content}`);
    }

    for (const a of msg.attachments.values()) {
      lines.push(`${msg.author.username} [${date}]`);
      lines.push(`  [Plik: ${a.name}] ${a.url}`);
    }

    lines.push(``);
  }

  lines.push(`------------------------------------------------`);
  lines.push(`Koniec transkryptu`);

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
      const transcript = await generateTranscript(channel);
      const fileName = `transcript-${channel.name}.txt`;
      const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: fileName });

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🔒 Ticket Zamknięty')
          .addFields(
            { name: 'Kanał', value: `${channel.name}`, inline: true },
            { name: 'Zamknął', value: `${interaction.user}`, inline: true },
            { name: 'Wiadomości', value: `${transcript.split('\n').filter(l => l.match(/^\w.+\[\d{2}\/\d{2}\/\d{4}/)).length}`, inline: true },
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
