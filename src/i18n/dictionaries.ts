export type Locale = "en" | "de";

export const locales: Locale[] = ["en", "de"];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

type Dict = {
  nav: {
    brands: string;
    topics: string;
    devices: string;
    glossary: string;
    signIn: string;
    explore: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    statsGuides: string;
    statsBrands: string;
    statsVerified: string;
    popularTopics: string;
    browseBrands: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  common: {
    home: string;
    open: string;
    guides: string;
    updated: string;
    steps: string;
    min: string;
    allBrands: string;
    search: string;
    back: string;
    loading: string;
  };
  guide: {
    liveSimulator: string;
    pathVerified: string;
    wasCorrect: string;
    yesCorrect: string;
    no: string;
    confirmations: string;
    forumVerified: string;
    thanksFeedback: string;
    faq: string;
    moreGuides: string;
    compatibleDevices: string;
    exploreTopics: string;
    previous: string;
    next: string;
    followHighlight: string;
  };
  topics: {
    title: string;
    subtitle: string;
    openHub: string;
    otherTopics: string;
    allTopics: string;
  };
  devices: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noResults: string;
    relatedDevices: string;
    guidesForDevice: string;
    moreBrand: string;
    viewHub: string;
  };
  glossary: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    relatedGuides: string;
    moreIn: string;
    backToGlossary: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    createAccount: string;
    email: string;
    password: string;
    name: string;
    forgotPassword: string;
    continueGoogle: string;
    noAccount: string;
    hasAccount: string;
    or: string;
  };
  copilot: {
    ask: string;
    title: string;
    subtitle: string;
    placeholder: string;
    welcome: string;
  };
  footer: {
    tagline: string;
    brands: string;
    topics: string;
    explore: string;
    legal: string;
    privacy: string;
    terms: string;
  };
};

export const dictionaries: Record<Locale, Dict> = {
  en: {
    nav: {
      brands: "Brands",
      topics: "Topics",
      devices: "Devices",
      glossary: "Glossary",
      signIn: "Sign In",
      explore: "Explore",
    },
    home: {
      heroTitle: "Find the exact path. No guessing.",
      heroSubtitle:
        "Interactive step-by-step settings guides for Samsung, Xiaomi, Huawei and more — verified, versioned, visual.",
      searchPlaceholder: "Search guides, devices, topics…",
      statsGuides: "Guides",
      statsBrands: "Brands",
      statsVerified: "Paths verified",
      popularTopics: "Popular topics",
      browseBrands: "Browse by brand",
      ctaTitle: "Stuck in settings?",
      ctaBody: "Open a brand hub or ask the TapPath copilot.",
      ctaButton: "Explore guides",
    },
    common: {
      home: "Home",
      open: "Open",
      guides: "guides",
      updated: "Updated",
      steps: "steps",
      min: "min",
      allBrands: "All brands",
      search: "Search",
      back: "Back",
      loading: "Loading…",
    },
    guide: {
      liveSimulator: "Live simulator",
      pathVerified: "Path verified",
      wasCorrect: "Was the guide correct?",
      yesCorrect: "Yes, correct",
      no: "No",
      confirmations: "confirmations",
      forumVerified: "Forum verified this path",
      thanksFeedback: "Thanks for your feedback!",
      faq: "Frequently asked questions",
      moreGuides: "More guides for",
      compatibleDevices: "Compatible devices",
      exploreTopics: "Explore topics",
      previous: "Previous",
      next: "Next",
      followHighlight: "Follow the highlighted element on the phone.",
    },
    topics: {
      title: "Topic hubs",
      subtitle:
        "Cross-brand guides for the most important smartphone topics — grouped by category, filterable by brand.",
      openHub: "Open topic hub",
      otherTopics: "Other topics",
      allTopics: "All topics",
    },
    devices: {
      title: "Device directory",
      subtitle: "All smartphone models with guides and specs. Search by name, brand or OS version.",
      searchPlaceholder: "Search devices (e.g. Galaxy S24, Pixel 9, HyperOS)…",
      noResults: "No devices match your search. Try a different brand or keyword.",
      relatedDevices: "Related devices",
      guidesForDevice: "Guides for this device",
      moreBrand: "More {brand} help",
      viewHub: "View {brand} hub",
    },
    glossary: {
      title: "Tech glossary",
      subtitle: "Smartphone & technology terms explained simply.",
      searchPlaceholder: "Search terms (e.g. VoLTE, eSIM, AMOLED)…",
      relatedGuides: "Related guides",
      moreIn: "More in",
      backToGlossary: "Back to glossary",
    },
    auth: {
      signIn: "Sign in",
      signUp: "Sign up",
      createAccount: "Create account",
      email: "Email",
      password: "Password",
      name: "Name",
      forgotPassword: "Forgot password?",
      continueGoogle: "Continue with Google",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      or: "or",
    },
    copilot: {
      ask: "Ask TapPath",
      title: "TapPath Copilot",
      subtitle: "Settings & guides helper",
      placeholder: "Ask about a setting or term…",
      welcome:
        "Hi — I'm the TapPath copilot. Ask how to change a setting, or what a term means. I'll point you to the right guide.",
    },
    footer: {
      tagline: "Visual step-by-step smartphone settings guides.",
      brands: "Brands",
      topics: "Topics",
      explore: "Explore",
      legal: "Legal",
      privacy: "Privacy",
      terms: "Terms",
    },
  },
  de: {
    nav: {
      brands: "Marken",
      topics: "Themen",
      devices: "Geräte",
      glossary: "Glossar",
      signIn: "Anmelden",
      explore: "Entdecken",
    },
    home: {
      heroTitle: "Den genauen Pfad finden. Kein Raten.",
      heroSubtitle:
        "Interaktive Schritt-für-Schritt-Anleitungen für Samsung, Xiaomi, Huawei und mehr — geprüft, versioniert, visuell.",
      searchPlaceholder: "Anleitungen, Geräte, Themen suchen…",
      statsGuides: "Anleitungen",
      statsBrands: "Marken",
      statsVerified: "Pfade geprüft",
      popularTopics: "Beliebte Themen",
      browseBrands: "Nach Marke durchsuchen",
      ctaTitle: "In den Einstellungen stecken geblieben?",
      ctaBody: "Öffne einen Marken-Hub oder frage den TapPath-Copiloten.",
      ctaButton: "Anleitungen entdecken",
    },
    common: {
      home: "Start",
      open: "Öffnen",
      guides: "Anleitungen",
      updated: "Aktualisiert",
      steps: "Schritte",
      min: "Min.",
      allBrands: "Alle Marken",
      search: "Suchen",
      back: "Zurück",
      loading: "Lädt…",
    },
    guide: {
      liveSimulator: "Live-Simulator",
      pathVerified: "Pfad geprüft",
      wasCorrect: "War die Anleitung korrekt?",
      yesCorrect: "Ja, korrekt",
      no: "Nein",
      confirmations: "Bestätigungen",
      forumVerified: "Forum hat diesen Pfad bestätigt",
      thanksFeedback: "Danke für dein Feedback!",
      faq: "Häufige Fragen",
      moreGuides: "Weitere Anleitungen für",
      compatibleDevices: "Kompatible Geräte",
      exploreTopics: "Themen entdecken",
      previous: "Zurück",
      next: "Weiter",
      followHighlight: "Folge dem hervorgehobenen Element auf dem Telefon.",
    },
    topics: {
      title: "Themen-Hubs",
      subtitle:
        "Markenübergreifende Anleitungen zu den wichtigsten Smartphone-Themen — nach Kategorie, filterbar nach Marke.",
      openHub: "Themen-Hub öffnen",
      otherTopics: "Andere Themen",
      allTopics: "Alle Themen",
    },
    devices: {
      title: "Geräteverzeichnis",
      subtitle: "Alle Smartphone-Modelle mit Anleitungen und Specs. Suche nach Name, Marke oder OS.",
      searchPlaceholder: "Geräte suchen (z. B. Galaxy S24, Pixel 9, HyperOS)…",
      noResults: "Keine Geräte gefunden. Andere Marke oder anderes Stichwort versuchen.",
      relatedDevices: "Ähnliche Geräte",
      guidesForDevice: "Anleitungen für dieses Gerät",
      moreBrand: "Mehr Hilfe zu {brand}",
      viewHub: "{brand}-Hub ansehen",
    },
    glossary: {
      title: "Technik-Glossar",
      subtitle: "Smartphone- und Technikbegriffe einfach erklärt.",
      searchPlaceholder: "Begriffe suchen (z. B. VoLTE, eSIM, AMOLED)…",
      relatedGuides: "Verwandte Anleitungen",
      moreIn: "Mehr unter",
      backToGlossary: "Zurück zum Glossar",
    },
    auth: {
      signIn: "Anmelden",
      signUp: "Registrieren",
      createAccount: "Konto erstellen",
      email: "E-Mail",
      password: "Passwort",
      name: "Name",
      forgotPassword: "Passwort vergessen?",
      continueGoogle: "Mit Google fortfahren",
      noAccount: "Noch kein Konto?",
      hasAccount: "Bereits ein Konto?",
      or: "oder",
    },
    copilot: {
      ask: "TapPath fragen",
      title: "TapPath-Copilot",
      subtitle: "Hilfe zu Einstellungen & Anleitungen",
      placeholder: "Frage zu Einstellung oder Begriff…",
      welcome:
        "Hallo — ich bin der TapPath-Copilot. Frag, wie du eine Einstellung änderst oder was ein Begriff bedeutet. Ich zeige dir die passende Anleitung.",
    },
    footer: {
      tagline: "Visuelle Schritt-für-Schritt-Anleitungen für Smartphone-Einstellungen.",
      brands: "Marken",
      topics: "Themen",
      explore: "Entdecken",
      legal: "Rechtliches",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
    },
  },
};

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}
