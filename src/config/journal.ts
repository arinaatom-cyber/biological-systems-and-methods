/**
 * Single source of truth for Biomedical Chemistry (БМХ).
 * Replace null / 0 with real values only when confirmed — never invent data.
 */

export type FundingItem = {
  id: string;
  funderName: string;
  awardId?: string | null;
  country?: string | null;
  url?: string | null;
};

export type PartnerOrg = {
  id: string;
  name: string;
  url?: string | null;
  logoUrl?: string | null;
  role?: "sponsor" | "affiliate" | "technical" | string;
};

export type JournalConfig = {
  journalName: string;
  /** Russian display name */
  journalNameRU: string;
  /** Short code shown in UI (БМХ) */
  journalNameShort: string;
  journalSubtitle: string;
  journalTaglineRu: string;
  journalTaglineEn: string;
  /** @deprecated use journalNameShort — kept for older callers */
  journalAcronym: string | null;
  /** @deprecated use journalNameRU */
  journalNameRu: string;
  /** Displayed grant / funder cards on About / Publisher pages */
  fundingInfo: FundingItem[];
  /** ANO + LLC operating model for Publisher page */
  publisherType: string;
  /** University / sponsor logos — render when non-empty */
  partners: PartnerOrg[];
  currentYear: number;
  volumeNumber: number;
  issueNumber: number | null;
  issn: string | null;
  eissn: string | null;
  publisherName: string | null;
  legalEntityName: string | null;
  registrationCountry: string | null;
  legalAddress: string | null;
  postalAddress: string | null;
  registrationDetails: string | null;
  responsiblePublisher: string | null;
  editorInChief: string | null;
  officialDomain: string | null;
  officialEmail: string | null;
  temporaryEmail: string;
  emails: {
    coordinator: string;
    editorial: string | null;
    support: string | null;
    submissions: string | null;
    ethics: string | null;
  };
  apcRUB: number;
  apcCNY: number;
  license: string;
  licenseAppliedToPublishedContent: boolean;
  firstDecisionDaysTarget: number;
  issuesPerYear: number;
  articlesCount: number;
  issuesCount: number;
  authorsCount: number;
  editorsCount: number;
  reviewersCount: number;
  countriesCount: number;
  boardStats: {
    editorInChief: number;
    scientificEditors: number;
    sectionEditors: number;
    statisticalEditors: number;
    dataEditors: number;
  };
  conferenceEnabled: boolean;
  chatEnabled: boolean;
  /** "local" = site form; "ojs" = redirect to Open Journal Systems */
  submissionMode: "local" | "ojs";
  /** Full URL to OJS submission wizard when ready */
  ojsUrl: string | null;
  ojsEnabled: boolean;
  submissionsEnabled: boolean;
  doiInfrastructureActive: boolean;
  languages: readonly ["en", "ru", "zh", "ar"];
  defaultLanguage: "ru" | "en" | "zh" | "ar";
  recordLanguage: "en";
  formSubmitEnabled: boolean;
  auth: {
    enabled: boolean;
    providers: readonly ["yandex", "mailru", "google", "orcid"];
  };
  apc: {
    submissionFree: boolean;
    reviewFree: boolean;
    waiverPolicyPublished: boolean;
    defaultCurrency: "RUB" | "CNY";
  };
};

export const journal: JournalConfig = {
  journalName: "Biomedical Chemistry",
  journalNameRU: "Биомедицинская химия",
  journalNameShort: "БМХ",
  journalSubtitle: "Специальный выпуск",
  journalTaglineRu:
    "Специальный выпуск журнала «Биомедицинская химия». Приглашённые редакторы, свой сайт.",
  journalTaglineEn:
    "Special issue of Biomeditsinskaya Khimiya. Invited editors, dedicated site.",
  journalAcronym: "БМХ",
  journalNameRu: "Биомедицинская химия",
  chatEnabled: false,
  submissionMode: "local",
  ojsUrl: null,
  ojsEnabled: false,
  fundingInfo: [],
  publisherType: "Учредитель",
  partners: [],
  currentYear: 2026,
  volumeNumber: 1,
  issueNumber: null,
  issn: "2310-6972",
  eissn: "2310-6905",
  publisherName: "ФГБНУ «Научно-исследовательский институт биомедицинской химии имени В.Н. Ореховича»",
  legalEntityName: "ФГБНУ «Научно-исследовательский институт биомедицинской химии имени В.Н. Ореховича»",
  registrationCountry: "Россия",
  legalAddress: null,
  postalAddress: null,
  registrationDetails: "ПИ № ФС77-82357. Выдано 10 декабря 2021 г.",
  responsiblePublisher: null,
  editorInChief: null,
  officialDomain: null,
  officialEmail: null,
  temporaryEmail: "arina.atom@gmail.com",
  emails: {
    coordinator: "arina.atom@gmail.com",
    editorial: null,
    support: null,
    submissions: null,
    ethics: null,
  },
  apcRUB: 0,
  apcCNY: 0,
  license: "CC BY",
  licenseAppliedToPublishedContent: false,
  firstDecisionDaysTarget: 21,
  issuesPerYear: 1,
  articlesCount: 0,
  issuesCount: 0,
  authorsCount: 0,
  editorsCount: 0,
  reviewersCount: 0,
  countriesCount: 0,
  boardStats: {
    editorInChief: 0,
    scientificEditors: 0,
    sectionEditors: 0,
    statisticalEditors: 0,
    dataEditors: 0,
  },
  conferenceEnabled: false,
  submissionsEnabled: true,
  doiInfrastructureActive: false,
  languages: ["en", "ru", "zh", "ar"],
  defaultLanguage: "ru",
  recordLanguage: "en",
  formSubmitEnabled: true,
  auth: {
    enabled: true,
    providers: ["yandex", "mailru", "google", "orcid"],
  },
  apc: {
    submissionFree: true,
    reviewFree: true,
    waiverPolicyPublished: false,
    defaultCurrency: "RUB",
  },
};

/** Display helper: null ISSN → em dash */
export function formatIssn(value: string | null | undefined): string {
  return value ? String(value) : "—";
}

export function contactEmail(cfg: JournalConfig = journal): string {
  return (
    cfg.emails.coordinator ||
    cfg.temporaryEmail ||
    cfg.officialEmail ||
    "arina.atom@gmail.com"
  );
}
