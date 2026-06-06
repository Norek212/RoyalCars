import { logger } from '../utils/logger.js';


export const botConfig = {
  // =========================
  // OBECNOŚĆ BOTA (co użytkownicy widzą pod nazwą bota)
  // =========================
  // Opcje `status`:
  // - "online"    = zielona kropka
  // - "idle"      = żółty księżyc
  // - "dnd"       = czerwone "nie przeszkadzać"
  // - "invisible" = wygląda jakby był offline
  presence: {
    // Aktualny stan online widoczny na Discordzie.
    status: "online",

    // Linie aktywności wyświetlane pod nazwą bota.
    // Mapowanie numerów `type` z Discorda:
    // 0 = Gra w
    // 1 = Transmituje
    // 2 = Słucha
    // 3 = Ogląda
    // 4 = Własny
    // 5 = Rywalizuje w
    activities: [
      {
        // Tekst widoczny dla użytkowników (przykład: "Gra w /help | Titan Bot").
        name: "Zamówienia ticket 🚗",
        // Numer typu aktywności (0 = Gra w).
        type: 0, 
      },
    ],
  },

  // =========================
  // ZACHOWANIE KOMEND
  // =========================
  commands: {
    // ID właścicieli bota (oddzielone przecinkami w zmiennej środowiskowej OWNER_IDS).
    // Właściciele mają dostęp do komend na poziomie właściciela/admina.
    owners: process.env.OWNER_IDS?.split(",") || [],

    // Domyślny czas oczekiwania między użyciami komendy (w sekundach).
    defaultCooldown: 3, 

    // Jeśli true, stare komendy są usuwane przed ponowną rejestracją.
    deleteCommands: false,

    // Opcjonalne ID serwera używane do szybkiego testowania komend slash.
    testGuildId: process.env.TEST_GUILD_ID,
  },

  // =========================
  // SYSTEM APLIKACJI
  // =========================
  applications: {
    // Domyślne pytania wyświetlane przy wypełnianiu aplikacji.
    defaultQuestions: [
      { question: "Jak masz na imię?", required: true },
      { question: "Ile masz lat?", required: true },
      { question: "Dlaczego chcesz dołączyć?", required: true },
    ],

    // Kolory embedów według statusu aplikacji.
    statusColors: {
      pending: "#FFA500",
      approved: "#00FF00",
      denied: "#FF0000",
    },

    // Jak długo użytkownicy muszą czekać przed wysłaniem kolejnej aplikacji (godziny).
    applicationCooldown: 24, 

    // Automatyczne usuwanie odrzuconych aplikacji po tej liczbie dni.
    deleteDeniedAfter: 7, 

    // Automatyczne usuwanie zaakceptowanych aplikacji po tej liczbie dni.
    deleteApprovedAfter: 30, 

    // ID ról uprawnionych do zarządzania aplikacjami.
    managerRoles: [], // Uzupełniane ze środowiska lub bazy danych
  },

  // =========================
  // KOLORY EMBEDÓW I BRANDING
  // =========================
  // WAŻNE: To jest JEDYNE ŹRÓDŁO PRAWDY dla wszystkich kolorów bota
  embeds: {
    colors: {
      // Główne kolory marki.
      primary: "#336699", 
      secondary: "#2F3136", 

      // Standardowe kolory statusów dla wiadomości sukcesu/błędu/ostrzeżenia/informacji.
      success: "#57F287", 
      error: "#ED4245", 
      warning: "#FEE75C", 
      info: "#3498DB", 

      // Neutralne kolory użytkowe.
      light: "#FFFFFF",
      dark: "#202225",
      gray: "#99AAB5",

      // Skróty palety w stylu Discorda.
      blurple: "#5865F2",
      green: "#57F287",
      yellow: "#FEE75C",
      fuchsia: "#EB459E",
      red: "#ED4245",
      black: "#000000",

      // Kolory specyficzne dla funkcji.
      giveaway: {
        active: "#57F287",
        ended: "#ED4245",
      },
      ticket: {
        open: "#57F287",
        claimed: "#FAA61A",
        closed: "#ED4245",
        pending: "#99AAB5",
      },
      economy: "#F1C40F",
      birthday: "#E91E63",
      moderation: "#9B59B6",

      // Mapowanie kolorów priorytetu ticketu.
      priority: {
        none: "#95A5A6",
        low: "#3498db",
        medium: "#2ecc71",
        high: "#f1c40f",
        urgent: "#e74c3c",
      },
    },
    footer: {
      // Domyślny tekst stopki używany w embedach bota.
      text: "Titan Bot",
      // URL ikony stopki (null = brak ikony).
      icon: null,
    },
    // Domyślny URL miniaturki embedów (null = brak miniaturki).
    thumbnail: null,
    author: {
      // Opcjonalny domyślny blok autora embeda.
      name: null,
      icon: null,
      url: null,
    },
  },

  // =========================
  // USTAWIENIA EKONOMII
  // =========================
  economy: {
    currency: {
      // Wyświetlana nazwa waluty.
      name: "coins",
      // Wyświetlana nazwa w liczbie mnogiej.
      namePlural: "coins",
      // Symbol waluty pokazywany przy saldach.
      symbol: "$",
    },

    // Saldo startowe dla nowych użytkowników.
    startingBalance: 0,

    // Maksymalna pojemność banku przed ulepszeniami (jeśli ulepszenia są używane).
    baseBankCapacity: 100000,

    // Dzienna nagroda.
    dailyAmount: 100,

    // Zakres losowej wypłaty za pracę.
    workMin: 10,
    workMax: 100,

    // Zakres losowej wypłaty za żebranie.
    begMin: 5,
    begMax: 50,

    // Szansa na sukces przy kradzieży (0.4 = 40%).
    robSuccessRate: 0.4,

    // Czas więzienia po nieudanej kradzieży (milisekundy).
    // 3600000 = 1 godzina.
    robFailJailTime: 3600000, 
  },

  // =========================
  // USTAWIENIA SKLEPU
  // =========================
  // Dodaj tutaj domyślne ustawienia sklepu gdy będą potrzebne.
  shop: {
    
  },

  // =========================
  // SYSTEM TICKETÓW
  // =========================
  tickets: {
    // ID kategorii, w której tworzone są nowe tickety (null = brak wymuszonej kategorii).
    defaultCategory: null,

    // ID ról uprawnionych do zarządzania/obsługi ticketów.
    supportRoles: [],

    // Opcje priorytetu, które użytkownicy/personel mogą przypisywać.
    priorities: {
      none: {
        emoji: "⚪",
        color: "#95A5A6",
        label: "Brak",
      },
      low: {
        emoji: "🟢",
        color: "#2ECC71",
        label: "Niski",
      },
      medium: {
        emoji: "🟡",
        color: "#F1C40F",
        label: "Średni",
      },
      high: {
        emoji: "🔴",
        color: "#E74C3C",
        label: "Wysoki",
      },
      urgent: {
        emoji: "🚨",
        color: "#E91E63",
        label: "Pilny",
      },
    },

    // Domyślny priorytet dla nowych ticketów.
    defaultPriority: "none",

    // ID kategorii, do której archiwizowane są zamknięte tickety.
    archiveCategory: null,

    // ID kanału, na który wysyłane są logi ticketów.
    logChannel: null,
  },

  // =========================
  // USTAWIENIA ROZDAŃ (GIVEAWAY)
  // =========================
  giveaways: {
    // Domyślny czas trwania rozdania w milisekundach.
    // 86400000 = 24 godziny.
    defaultDuration: 86400000, 

    // Dozwolony zakres liczby zwycięzców.
    minimumWinners: 1,
    maximumWinners: 10,

    // Dozwolony zakres czasu trwania rozdania w milisekundach.
    // 300000 = 5 minut.
    minimumDuration: 300000, 
    // 2592000000 = 30 dni.
    maximumDuration: 2592000000, 

    // ID ról uprawnionych do organizowania rozdań.
    allowedRoles: [],

    // ID ról, które omijają ograniczenia rozdań.
    bypassRoles: [],
  },

  // =========================
  // USTAWIENIA URODZIN
  // =========================
  birthday: {
    // ID roli nadawanej użytkownikom w dniu urodzin.
    defaultRole: null,

    // ID kanału, na którym publikowane są ogłoszenia urodzinowe.
    announcementChannel: null,

    // Strefa czasowa używana do obliczania dat urodzin.
    timezone: "UTC",
  },

  // =========================
  // USTAWIENIA WERYFIKACJI
  // =========================
  verification: {
    // Wiadomość wyświetlana przy publikowaniu panelu weryfikacji.
    defaultMessage: "Kliknij przycisk poniżej, aby się zweryfikować i uzyskać dostęp do serwera!",

    // Tekst na przycisku weryfikacji.
    defaultButtonText: "Weryfikuj",

    // Automatyczne zachowanie weryfikacji.
    autoVerify: {
      // Jak automatyczna weryfikacja decyduje, kto jest automatycznie zatwierdzany:
      // - "none"        = wszyscy są natychmiast auto-weryfikowani
      // - "account_age" = konto musi być starsze niż określona liczba dni
      // - "server_size" = auto-weryfikuj wszystkich tylko na mniejszych serwerach
      defaultCriteria: "none",

      // Dni używane gdy `defaultCriteria` to `account_age`.
      defaultAccountAgeDays: 7,

      // Próg liczby członków używany gdy `defaultCriteria` to `server_size`.
      // Przykład: 1000 oznacza auto-weryfikację jeśli serwer ma mniej niż 1000 członków.
      serverSizeThreshold: 1000,

      // Dozwolone limity bezpieczeństwa dla wymagań wieku konta.
      // 1 = minimalny dzień, 365 = maksymalna liczba dni.
      minAccountAge: 1,      
      maxAccountAge: 365,    

      // Jeśli true, użytkownik otrzymuje DM po weryfikacji.
      sendDMNotification: true,

      // Opisy w języku naturalnym dla każdego trybu kryteriów.
      criteria: {
        account_age: "Konto musi być starsze niż określona liczba dni",
        server_size: "Wszyscy użytkownicy jeśli serwer ma mniej niż 1000 członków",
        none: "Wszyscy użytkownicy natychmiast"
      }
    },

    // Minimalny czas między próbami weryfikacji (milisekundy).
    // 5000 = 5 sekund.
    verificationCooldown: 5000,  

    // Maksymalna liczba nieudanych prób dozwolona w oknie czasowym poniżej.
    maxVerificationAttempts: 3,   

    // Okno czasowe do liczenia prób (milisekundy).
    // 60000 = 1 minuta.
    attemptWindow: 60000,          

    // Limity bezpieczeństwa w pamięci (pomaga uniknąć nieograniczonego wzrostu pamięci).
    maxCooldownEntries: 10000,
    maxAttemptEntries: 10000,
    // Częstotliwość czyszczenia map cooldown/prób (milisekundy).
    // 300000 = 5 minut.
    cooldownCleanupInterval: 300000, 
    // Maksymalny rozmiar metadanych dla wpisów audytu (bajty).
    maxAuditMetadataBytes: 4096,
    // Maksymalna liczba wpisów audytu przechowywanych w pamięci.
    maxInMemoryAuditEntries: 1000,
  // Jeśli true, loguj każdą akcję weryfikacji.
  logAllVerifications: true,
  // Jeśli true, zachowaj historię audytu weryfikacji.
  keepAuditTrail: true,
  },

  // =========================
  // WIADOMOŚCI POWITALNE / POŻEGNALNE
  // =========================
  welcome: {
    // Szablon powitalny publikowany gdy użytkownik dołącza.
    // Zmienne: {user}, {server}, {memberCount}
    defaultWelcomeMessage:
      "Witaj {user} na {server}! Mamy teraz {memberCount} członków!",
    // Szablon pożegnalny publikowany gdy użytkownik wychodzi.
    // Zmienne: {user}, {memberCount}
    defaultGoodbyeMessage:
      "{user} opuścił serwer. Mamy teraz {memberCount} członków.",
    // ID kanału dla wiadomości powitalnych.
    defaultWelcomeChannel: null,
    // ID kanału dla wiadomości pożegnalnych.
    defaultGoodbyeChannel: null,
  },

  // =========================
  // KANAŁY LICZNIKÓW
  // =========================
  counters: {
    defaults: {
      // Domyślne szablony nazw/opisów dla wpisów liczników.
      name: "{name} Licznik",
      description: "Licznik {name} serwera",
      // Typ kanału używany dla liczników (zazwyczaj "głosowy").
      type: "voice",
      // Format nazwy kanału. `{count}` jest zastępowane automatycznie.
      channelName: "{name}-{count}",
    },
    permissions: {
      // Domyślne odebrane uprawnienia dla kanału licznika.
      deny: ["VIEW_CHANNEL"],
      // Domyślne nadane uprawnienia dla kanału licznika.
      allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
    },
    messages: {
      // Domyślne wiadomości odpowiedzi dla akcji licznika.
      created: "✅ Utworzono licznik **{name}**",
      deleted: "🗑️ Usunięto licznik **{name}**",
      updated: "🔄 Zaktualizowano licznik **{name}**",
    },
    types: {
      // Wbudowane typy liczników i sposób obliczania każdej wartości.
      members: {
        name: "👥 Członkowie",
        description: "Łączna liczba członków serwera",
        getCount: (guild) => guild.memberCount.toString(),
      },
      bots: {
        name: "🤖 Boty",
        description: "Łączna liczba kont botów na serwerze",
        getCount: (guild) =>
          guild.members.cache.filter((m) => m.user.bot).size.toString(),
      },
      members_only: {
        name: "👤 Ludzie",
        description: "Łączna liczba ludzkich członków (bez botów)",
        getCount: (guild) =>
          guild.members.cache.filter((m) => !m.user.bot).size.toString(),
      },
    },
  },

  // =========================
  // OGÓLNE WIADOMOŚCI BOTA
  // =========================
  messages: {
    noPermission: "Nie masz uprawnień do użycia tej komendy.",
    cooldownActive: "Poczekaj {time} przed ponownym użyciem tej komendy.",
    errorOccurred: "Wystąpił błąd podczas wykonywania tej komendy.",
    missingPermissions:
      "Brakuje mi wymaganych uprawnień do wykonania tej akcji.",
    commandDisabled: "Ta komenda została wyłączona.",
    maintenanceMode: "Bot jest aktualnie w trybie konserwacji.",
  },

  // =========================
  // PRZEŁĄCZNIKI FUNKCJI
  // =========================
  // Ustaw dowolną funkcję na `false`, aby wyłączyć ją globalnie.
  features: {
    // Systemy podstawowe.
    economy: true,
    leveling: true,
    moderation: true,
    logging: true,
    welcome: true,

    // Systemy zaangażowania społeczności.
    tickets: true,
    giveaways: true,
    birthday: true,
    counter: true,

    // Systemy bezpieczeństwa i samoobsługi.
    verification: true,
    reactionRoles: true,
    joinToCreate: true,

    // Moduły użytkowe / jakości życia.
    voice: true,
    search: true,
    tools: true,
    utility: true,
    community: true,
    fun: true,
  },
};


export function validateConfig(config) {
  const errors = [];

  
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Sprawdzanie zmiennych środowiskowych:');
    logger.debug('DISCORD_TOKEN istnieje:', !!process.env.DISCORD_TOKEN);
    logger.debug('TOKEN istnieje:', !!process.env.TOKEN);
    logger.debug('CLIENT_ID istnieje:', !!process.env.CLIENT_ID);
    logger.debug('GUILD_ID istnieje:', !!process.env.GUILD_ID);
    logger.debug('POSTGRES_HOST istnieje:', !!process.env.POSTGRES_HOST);
    logger.debug('NODE_ENV:', process.env.NODE_ENV);
  }

  if (!process.env.DISCORD_TOKEN && !process.env.TOKEN) {
    errors.push("Token bota jest wymagany (zmienna środowiskowa DISCORD_TOKEN lub TOKEN)");
  }

  if (!process.env.CLIENT_ID) {
    errors.push("Client ID jest wymagane (zmienna środowiskowa CLIENT_ID)");
  }

  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.POSTGRES_HOST) {
      errors.push("Host PostgreSQL jest wymagany w produkcji (zmienna środowiskowa POSTGRES_HOST)");
    }
    if (!process.env.POSTGRES_USER) {
      errors.push("Użytkownik PostgreSQL jest wymagany w produkcji (zmienna środowiskowa POSTGRES_USER)");
    }
    if (!process.env.POSTGRES_PASSWORD) {
      errors.push("Hasło PostgreSQL jest wymagane w produkcji (zmienna środowiskowa POSTGRES_PASSWORD)");
    }
  }

  return errors;
}


const configErrors = validateConfig(botConfig);
if (configErrors.length > 0) {
  logger.error("Błędy konfiguracji bota:", configErrors.join("\n"));
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}


export const BotConfig = botConfig;

export function getColor(path, fallback = "#99AAB5") {
  
  if (typeof path === "number") return path;
  if (typeof path === "string" && path.startsWith("#")) {
    
    return parseInt(path.replace("#", ""), 16);
  }
  const result = path
    .split(".")
    .reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : fallback),
      botConfig.embeds.colors,
    );
  
  // Konwertuj wynik na liczbę całkowitą jeśli jest hexem
  if (typeof result === "string" && result.startsWith("#")) {
    return parseInt(result.replace("#", ""), 16);
  }
  return result;
}

export function getRandomColor() {
  const colors = Object.values(botConfig.embeds.colors).flatMap((color) =>
    typeof color === "string" ? color : Object.values(color),
  );
  return colors[Math.floor(Math.random() * colors.length)];
}

export default botConfig;
