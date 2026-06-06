import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Wyślij panel ticketów na kanał')
    .addChannelOption((o) =>
      o.setName('kanał').setDescription('Kanał na który wysłać panel').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, guildConfig, client) {
    const channel = interaction.options.getChannel('kanał');

    const embed = new EmbedBuilder()
      .setTitle('Wsparcie i zakup')
      .setDescription('Kliknij poniżej aby stworzyć ticketa')
      .setColor(0x5865f2)
      .setFooter({ text: 'Powered by RoyalCars' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('rc_ticket_create')
      .setPlaceholder('Select an option')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Pomoc')
          .setValue('pomoc')
          .setEmoji('🆘'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Zakup')
          .setValue('zakup')
          .setEmoji('💰'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Sprawa do Zarządu')
          .setValue('zarzad')
          .setEmoji('📋'),
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Panel ticketów wysłany na ${channel}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
