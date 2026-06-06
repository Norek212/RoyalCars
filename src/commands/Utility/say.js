import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Wyślij wiadomość jako bot')
    .addChannelOption((o) =>
      o.setName('kanał').setDescription('Kanał docelowy (domyślnie obecny)').setRequired(false).addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, guildConfig, client) {
    const channel = interaction.options.getChannel('kanał') ?? interaction.channel;

    client.saySessions = client.saySessions ?? new Map();
    client.saySessions.set(interaction.user.id, channel.id);

    const modal = new ModalBuilder()
      .setCustomId('say_modal')
      .setTitle('Wyślij wiadomość');

    const input = new TextInputBuilder()
      .setCustomId('say_text')
      .setLabel('Treść wiadomości')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Wpisz wiadomość... (emotki, nowe linie itp.)')
      .setRequired(true)
      .setMaxLength(2000);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
