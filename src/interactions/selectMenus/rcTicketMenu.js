import { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

const TICKET_TYPES = {
  pomoc:  { label: 'Pomoc',              emoji: '🆘' },
  zakup:  { label: 'Zakup',              emoji: '💰' },
  zarzad: { label: 'Sprawa do Zarządu',  emoji: '📋' },
};

export default {
  name: 'rc_ticket_create',
  async execute(interaction, client) {
    const type = interaction.values[0];
    const config = TICKET_TYPES[type];

    // Zapisz typ żeby modal go znał
    client.rcTicketSessions = client.rcTicketSessions ?? new Map();
    client.rcTicketSessions.set(interaction.user.id, type);

    const modal = new ModalBuilder()
      .setCustomId('rc_ticket_modal')
      .setTitle('Please answer the question below.');

    const input = new TextInputBuilder()
      .setCustomId('rc_ticket_reason')
      .setLabel('W czym możemy ci pomóc')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Type your message here...')
      .setRequired(true)
      .setMaxLength(1000);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
