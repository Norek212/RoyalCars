const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Stwórz i wyślij embed na wybrany kanał')
    .addChannelOption((option) =>
      option
        .setName('kanał')
        .setDescription('Kanał, na który zostanie wysłany embed')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanał');

    // Pusty embed jako punkt startowy
    const embed = new EmbedBuilder()
      .setDescription('Twój embed pojawi się tutaj...')
      .setColor(0x5865f2);

    const previewMessage = await interaction.reply({
      content: `📋 **Podgląd embeda** | Zostanie wysłany na: ${channel}\nKliknij przyciski poniżej, aby edytować embed.`,
      embeds: [embed],
      components: buildComponents(),
      ephemeral: true,
      fetchReply: true,
    });

    // Zapisz stan embeda w kolekcji sesji
    interaction.client.embedSessions.set(interaction.user.id, {
      channelId: channel.id,
      messageId: previewMessage.id,
      data: {
        author: null,
        authorIcon: null,
        title: null,
        url: null,
        description: 'Twój embed pojawi się tutaj...',
        color: 0x5865f2,
        thumbnail: null,
        image: null,
        footer: null,
        footerIcon: null,
      },
    });
  },
};

function buildComponents() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('embed_author')
      .setLabel('Set Author')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_title')
      .setLabel('Set Title')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_description')
      .setLabel('Set Description')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_color')
      .setLabel('Set Color')
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('embed_image')
      .setLabel('Set Image')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_thumbnail')
      .setLabel('Set Thumbnail')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_footer')
      .setLabel('Set Footer')
      .setStyle(ButtonStyle.Primary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('embed_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('embed_send')
      .setLabel('Send Embed')
      .setStyle(ButtonStyle.Success)
  );

  return [row1, row2, row3];
}
