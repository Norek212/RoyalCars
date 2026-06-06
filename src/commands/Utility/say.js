import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Wyślij wiadomość jako bot')
    .addStringOption((o) =>
      o.setName('wiadomość').setDescription('Treść wiadomości').setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName('kanał').setDescription('Kanał docelowy (domyślnie obecny)').setRequired(false).addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, guildConfig, client) {
    const text = interaction.options.getString('wiadomość');
    const channel = interaction.options.getChannel('kanał') ?? interaction.channel;

    await channel.send(text);

    await interaction.reply({
      content: `✅ Wysłano na ${channel}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
