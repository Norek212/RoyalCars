import { MessageFlags } from 'discord.js';

export default {
  name: 'say_modal',
  async execute(interaction, client) {
    const text = interaction.fields.getTextInputValue('say_text');
    const channelId = client.saySessions?.get(interaction.user.id) ?? interaction.channelId;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ content: '❌ Nie znaleziono kanału.', flags: MessageFlags.Ephemeral });
    }

    await channel.send(text);
    client.saySessions?.delete(interaction.user.id);

    await interaction.reply({ content: `✅ Wysłano na ${channel}`, flags: MessageFlags.Ephemeral });
  },
};
