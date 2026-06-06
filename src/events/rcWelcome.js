import { EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

const WELCOME_CHANNEL_ID = '1505557389955563765';
const AUTO_ROLE_ID = '1505557388470653035';

export default {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      // Nadaj rolę
      const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
      if (role) {
        await member.roles.add(role);
      } else {
        logger.warn(`[welcome] Nie znaleziono roli ${AUTO_ROLE_ID}`);
      }

      // Wyślij wiadomość powitalną
      const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
      if (!channel) {
        logger.warn(`[welcome] Nie znaleziono kanału ${WELCOME_CHANNEL_ID}`);
        return;
      }

      const memberCount = member.guild.memberCount;

      await channel.send(
        `Witaj ${member} na serwerze **RoyalCars [PL/ENG/D]**! Jesteś naszym **${memberCount}** użytkownikiem.\n• Mamy nadzieję, że zostaniesz z nami na dłużej.`
      );

    } catch (error) {
      logger.error('[welcome] Błąd:', error);
    }
  },
};
