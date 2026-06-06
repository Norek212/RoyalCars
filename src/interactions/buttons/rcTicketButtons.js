import { MessageFlags, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';

const CATEGORY_ID = '1505557392593522799';

export const rcTicketClose = {
  name: 'rc_ticket_close',
  async execute(interaction, client) {
    const channel = interaction.channel;

    // Sprawdź czy to kanał ticketu
    if (channel.parentId !== CATEGORY_ID) {
      return interaction.reply({ content: '❌ To nie jest kanał ticketu.', flags: MessageFlags.Ephemeral });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔒 Ticket Closed')
      .setDescription(`Ticket zamknięty przez ${interaction.user}.`)
      .setColor(0xed4245)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Poczekaj 5 sekund i usuń kanał
    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (error) {
        logger.error('[rcTicket] Błąd usuwania kanału:', error);
      }
    }, 5000);
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
      .setColor(0xfaa61a);

    await interaction.reply({ embeds: [embed] });
  },
};

export default [rcTicketClose, rcTicketClaim];
