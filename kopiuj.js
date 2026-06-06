const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kopiuj')
    .setDescription('Kopiuje wiadomości z kanału i wysyła je jako bot')
    .addChannelOption((option) =>
      option
        .setName('skad')
        .setDescription('Kanał źródłowy (skąd kopiować)')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('dokad')
        .setDescription('Kanał docelowy (gdzie wklejać)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sourceChannel = interaction.options.getChannel('skad');
    const targetChannel = interaction.options.getChannel('dokad');

    // Pobierz wszystkie wiadomości
    let allMessages = [];
    let lastId = null;

    try {
      while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await sourceChannel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages = allMessages.concat([...messages.values()]);
        lastId = messages.last().id;

        if (messages.size < 100) break;
      }
    } catch (err) {
      return interaction.editReply('❌ Nie mogę odczytać wiadomości z tego kanału.');
    }

    if (allMessages.length === 0) {
      return interaction.editReply('❌ Brak wiadomości do skopiowania.');
    }

    allMessages.reverse();

    // Utwórz webhook na kanale docelowym
    let webhook;
    try {
      webhook = await targetChannel.createWebhook({
        name: interaction.client.user.username,
        avatar: interaction.client.user.displayAvatarURL(),
      });
    } catch (err) {
      return interaction.editReply('❌ Nie mogę utworzyć webhooka na kanale docelowym (sprawdź uprawnienia).');
    }

    await interaction.editReply(`⏳ Kopiowanie ${allMessages.length} wiadomości...`);

    let copied = 0;
    for (const msg of allMessages) {
      if (!msg.content && msg.attachments.size === 0) continue;

      try {
        await webhook.send({
          content: msg.content || ' ',
          username: interaction.client.user.username,
          avatarURL: interaction.client.user.displayAvatarURL(),
          files: [...msg.attachments.values()].map((a) => a.url),
        });
        copied++;
      } catch (err) {
        console.error('[KOPIUJ] Błąd przy wysyłaniu wiadomości:', err);
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    await webhook.delete();
    await interaction.editReply(`✅ Skopiowano **${copied}** wiadomości z <#${sourceChannel.id}> do <#${targetChannel.id}>.`);
  },
};
