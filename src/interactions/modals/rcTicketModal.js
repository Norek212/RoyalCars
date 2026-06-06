import { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';

const CATEGORY_ID = '1505557392593522799';

const TICKET_TYPES = {
  pomoc:  { label: 'Pomoc',             emoji: '🆘' },
  zakup:  { label: 'Zakup',             emoji: '💰' },
  zarzad: { label: 'Sprawa do Zarządu', emoji: '📋' },
};

export default {
  name: 'rc_ticket_modal',
  async execute(interaction, client) {
    const type = client.rcTicketSessions?.get(interaction.user.id);
    const reason = interaction.fields.getTextInputValue('rc_ticket_reason');

    if (!type) {
      return interaction.reply({ content: '❌ Sesja wygasła, spróbuj ponownie.', flags: MessageFlags.Ephemeral });
    }

    client.rcTicketSessions.delete(interaction.user.id);
    const config = TICKET_TYPES[type];

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // Sprawdź czy użytkownik ma już otwarty ticket
      const existing = interaction.guild.channels.cache.find(
        (c) => c.name === `ticket-${interaction.user.username.toLowerCase()}` && c.parentId === CATEGORY_ID
      );
      if (existing) {
        return interaction.editReply({ content: `❌ Masz już otwarty ticket: ${existing}` });
      }

      // Stwórz kanał ticketu
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
          },
        ],
      });

      // Embed w tickecie
      const embed = new EmbedBuilder()
        .setTitle('Ticket Opened')
        .setDescription(`${interaction.user} has created a new ${config.emoji} **${config.label}** ticket.`)
        .addFields({ name: 'W czym możemy ci pomóc', value: reason })
        .setColor(0x5865f2)
        .setFooter({ text: 'RoyalCars | /close' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('rc_ticket_close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('rc_ticket_claim')
          .setLabel('Claim Ticket')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋'),
      );

      await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });

      await interaction.editReply({ content: `✅ Twój ticket został stworzony: ${channel}` });

    } catch (error) {
      logger.error('[rcTicket] Błąd tworzenia ticketu:', error);
      await interaction.editReply({ content: '❌ Nie udało się stworzyć ticketu. Sprawdź uprawnienia bota.' });
    }
  },
};
