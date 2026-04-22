export const LOCALE_COOKIE_NAME = "packmate-locale";

export const supportedLocales = ["nl", "en_us"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "nl";

const htmlLangByLocale: Record<Locale, string> = {
  nl: "nl",
  en_us: "en-US",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getHtmlLang(locale: Locale): string {
  return htmlLangByLocale[locale];
}

const dictionaries = {
  nl: {
    appName: "Pakmaatje",
    metadata: {
      title: "Pakmaatje | Samen inpakken",
      description: "Samen voorbereiden op avontuur",
    },
    languageSwitcher: {
      nl: "Nederlands",
      en_us: "Engels (VS)",
    },
    common: {
      user: "Gebruiker",
      unknown: "Onbekend",
      signOut: "Uitloggen",
      private: "Privé",
      lists: "Lijsten",
      notes: "Notities",
      export: "Exporteren",
      rename: "Hernoemen",
      duplicate: "Dupliceren",
      unassigned: "Niet toegewezen",
    },
    dashboard: {
      title: "Projecten",
      newProject: "Nieuw project",
      createProjectTitle: "Nieuw project maken",
      projectName: "Projectnaam",
      projectDescription: "Beschrijving (optioneel)",
      projectNamePlaceholder: "bijv. Bikepacking 2026",
      projectDescriptionPlaceholder: "Een korte beschrijving van dit project...",
      privateProjectLabel: "Maak dit project privé (alleen zichtbaar voor jou)",
      createProject: "Project maken",
      creatingProject: "Bezig met maken...",
    },
    login: {
      tagline: "Samenwerkende paklijsten en projecten",
      signInTab: "Inloggen",
      registerTab: "Registreren",
      nameLabel: "Naam",
      namePlaceholder: "Jouw naam",
      emailLabel: "E-mail",
      emailPlaceholder: "naam@voorbeeld.nl",
      passwordLabel: "Wachtwoord",
      passwordPlaceholder: "Minimaal 8 tekens",
      signInButton: "Inloggen",
      signingInButton: "Bezig met inloggen...",
      registerButton: "Account aanmaken",
      registeringButton: "Bezig met registreren...",
      invalidCredentials: "Onjuiste e-mail of wachtwoord.",
      registerSuccess: "Account aangemaakt. Wacht op goedkeuring door een beheerder.",
      registerErrorDefault: "Account aanmaken is mislukt.",
      approvalNotice: "Goedkeuring door een beheerder is nodig voordat je dashboard beschikbaar is.",
    },
    pending: {
      title: "Goedkeuring in behandeling",
      description: "Je account is aangemaakt, maar een beheerder moet het eerst goedkeuren voordat je projecten en paklijsten kunt openen.",
      signOut: "Uitloggen en een ander account proberen",
    },
    admin: {
      title: "Beheerpanel",
      description: "Beheer gebruikers en toegangsrechten",
      user: "Gebruiker",
      email: "E-mail",
      status: "Status",
      role: "Rol",
      actions: "Acties",
      approve: "Goedkeuren",
      revoke: "Intrekken",
      makeAdmin: "Beheerder maken",
      statusApproved: "Goedgekeurd",
      statusPending: "In afwachting",
      roleAdmin: "Beheerder",
      roleUser: "Gebruiker",
    },
    project: {
      listsTab: "Lijsten",
      notesTab: "Notities en links",
      newList: "Nieuwe lijst",
      resetPacking: "Inpakken resetten",
      noLists: "Nog geen lijsten. Maak er een om te beginnen.",
      prompts: {
        projectName: "Projectnaam:",
        projectDescription: "Projectbeschrijving:",
        createList: "Voer een lijstnaam in (bijv. Zomeruitrusting):",
        renameList: "Lijst hernoemen:",
        duplicateList: "Naam voor gedupliceerde lijst:",
        duplicateSuffix: " (Kopie)",
        resetConfirm: "Weet je zeker dat je alles in deze lijst wilt terugzetten naar niet klaargelegd en niet ingepakt? Dit kan niet ongedaan worden gemaakt.",
      },
    },
    packing: {
      addCategory: "Categorie toevoegen",
      addItem: "Item toevoegen",
      total: "Totaal",
      staged: "Klaargelegd",
      packed: "Ingepakt",
      renameCategoryTitle: "Categorie hernoemen",
      duplicateCategoryTitle: "Categorie dupliceren",
      prompts: {
        createCategory: "Voer een categorienaam in (bijv. Slapen, Gereedschap):",
        createItem: "Voer een itemnaam in (bijv. '4x slaapzak' of 'tent'):",
        renameCategory: "Categorie hernoemen:",
        duplicateCategory: "Naam voor gedupliceerde categorie:",
        renameItem: "Item hernoemen:",
        quantity: "Aantal:",
        deleteItemConfirm: "Weet je zeker dat je dit item wilt verwijderen?",
      },
    },
    notesBoard: {
      addNoteTitle: "Notitie toevoegen",
      addNote: "Notitie toevoegen",
      noNotes: "Nog geen notities.",
      openInMaps: "Openen in Maps",
      textType: "Tekst",
      urlType: "Link",
      locationType: "Locatie",
      placeholders: {
        text: "Schrijf hier je notities...",
        url: "https://...",
        location: "Coördinaten of plaatsnaam...",
      },
    },
  },
  en_us: {
    appName: "Packmate",
    metadata: {
      title: "Packmate | Collaborative Packing",
      description: "Collaborative and categorized packing lists",
    },
    languageSwitcher: {
      nl: "Dutch",
      en_us: "English (US)",
    },
    common: {
      user: "User",
      unknown: "Unknown",
      signOut: "Sign out",
      private: "Private",
      lists: "Lists",
      notes: "Notes",
      export: "Export",
      rename: "Rename",
      duplicate: "Duplicate",
      unassigned: "Unassigned",
    },
    dashboard: {
      title: "Projects",
      newProject: "New Project",
      createProjectTitle: "Create New Project",
      projectName: "Project Name",
      projectDescription: "Description (Optional)",
      projectNamePlaceholder: "e.g. Bikepacking 2026",
      projectDescriptionPlaceholder: "A short description of this project...",
      privateProjectLabel: "Make this project private (only visible to you)",
      createProject: "Create Project",
      creatingProject: "Creating...",
    },
    login: {
      tagline: "Collaborative packing lists and projects",
      signInTab: "Sign In",
      registerTab: "Register",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      signInButton: "Sign In",
      signingInButton: "Signing in...",
      registerButton: "Create Account",
      registeringButton: "Creating account...",
      invalidCredentials: "Invalid email or password.",
      registerSuccess: "Account created. Wait for administrator approval.",
      registerErrorDefault: "Unable to create account.",
      approvalNotice: "Admin approval is required before you can access your dashboard.",
    },
    pending: {
      title: "Approval Pending",
      description: "Your account has been created, but it requires administrator approval before you can access projects and packing lists.",
      signOut: "Sign out and try another account",
    },
    admin: {
      title: "Admin Dashboard",
      description: "Manage users and access control",
      user: "User",
      email: "Email",
      status: "Status",
      role: "Role",
      actions: "Actions",
      approve: "Approve",
      revoke: "Revoke",
      makeAdmin: "Make Admin",
      statusApproved: "Approved",
      statusPending: "Pending",
      roleAdmin: "Admin",
      roleUser: "User",
    },
    project: {
      listsTab: "Lists",
      notesTab: "Notes & Links",
      newList: "New List",
      resetPacking: "Reset Packing",
      noLists: "No lists yet. Create one to get started.",
      prompts: {
        projectName: "Project Name:",
        projectDescription: "Project Description:",
        createList: "Enter list name (e.g., Summer Gear):",
        renameList: "Rename list:",
        duplicateList: "Name for duplicated list:",
        duplicateSuffix: " (Copy)",
        resetConfirm: "Are you sure you want to unstage and unpack everything in this list? This cannot be undone.",
      },
    },
    packing: {
      addCategory: "Add Category",
      addItem: "Add Item",
      total: "Total",
      staged: "Staged",
      packed: "Packed",
      renameCategoryTitle: "Rename Category",
      duplicateCategoryTitle: "Duplicate Category",
      prompts: {
        createCategory: "Enter category name (e.g., Sleeping, Tools):",
        createItem: "Enter item name (e.g. '4x sleeping bag' or 'tent'):",
        renameCategory: "Rename category:",
        duplicateCategory: "Name for duplicated category:",
        renameItem: "Rename item:",
        quantity: "Quantity:",
        deleteItemConfirm: "Are you sure you want to delete this item?",
      },
    },
    notesBoard: {
      addNoteTitle: "Add a Note",
      addNote: "Add Note",
      noNotes: "No notes yet.",
      openInMaps: "Open in Maps",
      textType: "TEXT",
      urlType: "URL",
      locationType: "LOCATION",
      placeholders: {
        text: "Write your notes here...",
        url: "https://...",
        location: "Coordinates or Place Name...",
      },
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}