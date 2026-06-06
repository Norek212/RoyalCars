const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

// Konfiguracja modali dla każdego przycisku
const MODAL_CONFIG = {
  embed_author: {
    id: 'modal_author',
    title: 'Ustaw autora',
    fields: [
      { id: 'author_name', label: 'Nazwa autora', placeholder: 'np. RoyalCars', required: true, style: TextInputStyle.Short },
      { id: 'author_icon', label: 'URL ikony autora (opcjonalne)', placeholder: 'https://...', required: false, style: TextInputStyle.Short },
    ],
  },
  embed_title: {
    id: 'modal_title',
    title: 'Ustaw tytuł',
    fields: [
      { id: 'title_text', label: 'Tytuł', placeholder: 'Wpisz tytuł embeda', required: true, style: TextInputStyle.Short },
      { id: 'title_url', label: 'URL tytułu (opcjonalne)', placeholder: 'https://...', required: false, style: TextInputStyle.Short },
    ],
  },
  embed_description: {
    id: 'modal_description',
    title: 'Ustaw opis',
    fields: [
      { id: 'desc_text', label: 'Opis', placeholder: 'Wpisz opis embeda...', required: true, style: TextInputStyle.Paragraph },
    ],
  },
  embed_color: {
    id: 'modal_color',
    title: 'Ustaw kolor',
    fields: [
      { id: 'color_hex', label: 'Kolor (HEX)', placeholder: 'np. #FF5733 lub 5865F2', required: true, style: TextInputStyle.Short },
    ],
  },
  embed_image: {
    id: 'modal_image',
    title: 'Ustaw obrazek',
    fields: [
      { id: 'image_url', label: 'URL obrazka', placeholder: 'https://...', required: true, style: TextInputStyle.Short },
    ],
  },
  embed_thumbnail: {
    id: 'modal_thumbnail',
    title: 'Ustaw miniaturę',
    fields: [
      { id: 'thumbnail_url', label: 'URL miniatury', placeholder: 'https://...', required: true, style: TextInputStyle.Short },
    ],
  },
  embed_footer: {
    id: 'modal_footer',
    title: 'Ustaw stopkę',
    fields: [
      { id: 'footer_text', label: 'Tekst stopki', placeholder: 'np. RoyalCars © 2024', required: true, style: TextInputStyle.Short },
      { id: 'footer_icon', label: 'URL ikony stopki (opcjonalne)', placeholder: 'https://...', required: false, style: TextInputStyle.Short },
    ],
  },
};

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    // ─── BUTTON HANDLER ───────────────────────────────────────────────────
    if (interaction.isButton()) {
      const session = client.embedSessions.get(interaction.user.id);

      // Anulowanie
      if (interaction.customId === 'embed_cancel') {
        client.embedSessions.delete(interaction.user.id);
        await interaction.update({
          content: '❌ Tworzenie embeda zostało anulowane.',
          embeds: [],
          components: [],
        });
        return;
      }

      // Wysyłanie embeda
      if (interaction.customId === 'embed_send') {
        if (!session) {
          await interaction.reply({ content: '❌ Nie znaleziono aktywnej sesji embeda.', ephemeral: true });
          return;
        }

        const channel = interaction.guild.channels.cache.get(session.channelId);
        if (!channel) {
          await interaction.reply({ content: '❌ Nie znaleziono kanału docelowego.', ephemeral: true });
          return;
        }

        const embed = buildEmbed(session.data);

        await channel.send({ embeds: [embed] });
        client.embedSessions.delete(interaction.user.id);

        await interaction.update({
          content: `✅ Embed został wysłany na ${channel}!`,
          embeds: [],
          components: [],
        });
        return;
      }

      // Otwieranie modala dla przycisków edycji
      const config = MODAL_CONFIG[interaction.customId];
      if (!config) return;

      const modal = new ModalBuilder().setCustomId(config.id).setTitle(config.title);

      const rows = config.fields.map((field) => {
        const input = new TextInputBuilder()
          .setCustomId(field.id)
          .setLabel(field.label)
          .setStyle(field.style)
          .setRequired(field.required);

        if (field.placeholder) input.setPlaceholder(field.placeholder);

        // Prefill z istniejącej sesji
        if (session) {
          const prefill = getPrefill(field.id, session.data);
          if (prefill) input.setValue(prefill);
        }

        return new ActionRowBuilder().addComponents(input);
      });

      modal.addComponents(...rows);
      await interaction.showModal(modal);
      return;
    }

    // ─── MODAL SUBMIT HANDLER ─────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const session = client.embedSessions.get(interaction.user.id);
      if (!session) {
        await interaction.reply({ content: '❌ Sesja wygasła. Użyj komendy `/embed` ponownie.', ephemeral: true });
        return;
      }

      // Aktualizacja danych sesji na podstawie ID modala
      switch (interaction.customId) {
        case 'modal_author':
          session.data.author = interaction.fields.getTextInputValue('author_name') || null;
          session.data.authorIcon = interaction.fields.getTextInputValue('author_icon') || null;
          break;
        case 'modal_title':
          session.data.title = interaction.fields.getTextInputValue('title_text') || null;
          session.data.url = interaction.fields.getTextInputValue('title_url') || null;
          break;
        case 'modal_description':
          session.data.description = interaction.fields.getTextInputValue('desc_text') || null;
          break;
        case 'modal_color': {
          const raw = interaction.fields.getTextInputValue('color_hex').replace('#', '');
          const parsed = parseInt(raw, 16);
          session.data.color = isNaN(parsed) ? 0x5865f2 : parsed;
          break;
        }
        case 'modal_image':
          session.data.image = interaction.fields.getTextInputValue('image_url') || null;
          break;
        case 'modal_thumbnail':
          session.data.thumbnail = interaction.fields.getTextInputValue('thumbnail_url') || null;
          break;
        case 'modal_footer':
          session.data.footer = interaction.fields.getTextInputValue('footer_text') || null;
          session.data.footerIcon = interaction.fields.getTextInputValue('footer_icon') || null;
          break;
      }

      client.embedSessions.set(interaction.user.id, session);

      // Aktualizuj podgląd
      const updatedEmbed = buildEmbed(session.data);
      const channel = interaction.guild.channels.cache.get(session.channelId);

      await interaction.update({
        content: `📋 **Podgląd embeda** | Zostanie wysłany na: ${channel}\nKliknij przyciski poniżej, aby edytować embed.`,
        embeds: [updatedEmbed],
        components: buildComponents(),
      });
    }
  },
};

// ─── HELPER: Buduje EmbedBuilder z danych sesji ───────────────────────────────
function buildEmbed(data) {
  const embed = new EmbedBuilder();

  if (data.color) embed.setColor(data.color);
  if (data.title) embed.setTitle(data.title);
  if (data.url && data.title) embed.setURL(data.url);
  if (data.description) embed.setDescription(data.description);
  if (data.image) embed.setImage(data.image);
  if (data.thumbnail) embed.setThumbnail(data.thumbnail);
  if (data.author) embed.setAuthor({ name: data.author, iconURL: data.authorIcon || undefined });
  if (data.footer) embed.setFooter({ text: data.footer, iconURL: data.footerIcon || undefined });

  return embed;
}

// ─── HELPER: Prefill pola modala z danych sesji ───────────────────────────────
function getPrefill(fieldId, data) {
  const map = {
    author_name: data.author,
    author_icon: data.authorIcon,
    title_text: data.title,
    title_url: data.url,
    desc_text: data.description,
    color_hex: data.color ? '#' + data.color.toString(16).padStart(6, '0') : null,
    image_url: data.image,
    thumbnail_url: data.thumbnail,
    footer_text: data.footer,
    footer_icon: data.footerIcon,
  };
  return map[fieldId] || null;
}

// ─── HELPER: Komponenty przycisków ────────────────────────────────────────────
function buildComponents() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_author').setLabel('Set Author').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_title').setLabel('Set Title').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_description').setLabel('Set Description').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_color').setLabel('Set Color').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_image').setLabel('Set Image').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_thumbnail').setLabel('Set Thumbnail').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_footer').setLabel('Set Footer').setStyle(ButtonStyle.Primary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('embed_send').setLabel('Send Embed').setStyle(ButtonStyle.Success)
  );
  return [row1, row2, row3];
}
