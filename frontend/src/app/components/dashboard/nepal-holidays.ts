export type CalendarEventCategory =
  | "nepal-public"
  | "nepal-festival"
  | "international-observance"
  | "personal";

export type CalendarEvent = {
  /** Gregorian date in YYYY-MM-DD format. */
  date: string;
  name: string;
  nameNp?: string;
  category: CalendarEventCategory;
  region?: "national" | "kathmandu-valley";
};

/**
 * Calendar events for the 2083 BS / 2026–27 AD period.
 *
 * Nepal dates are a practical starter list cross-checked against the
 * Kathmandu Metropolitan City calendar. Government holiday status can vary
 * by notice, region, and community; the UI therefore distinguishes public
 * holidays from festivals instead of implying every festival is a day off.
 * International dates are observances, not Nepal public-holiday claims.
 */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  { date: "2026-04-14", name: "Nepali New Year", nameNp: "नेपाली नयाँ वर्ष", category: "nepal-public" },
  { date: "2026-05-01", name: "Labour Day", nameNp: "मजदुर दिवस", category: "nepal-public" },
  { date: "2026-05-01", name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", category: "nepal-festival" },
  { date: "2026-05-29", name: "Republic Day", nameNp: "गणतन्त्र दिवस", category: "nepal-public" },
  { date: "2026-08-28", name: "Janai Purnima / Raksha Bandhan", nameNp: "जनै पूर्णिमा / रक्षा बन्धन", category: "nepal-festival" },
  { date: "2026-08-29", name: "Gai Jatra", nameNp: "गाईजात्रा", category: "nepal-festival", region: "kathmandu-valley" },
  { date: "2026-09-19", name: "Constitution Day", nameNp: "संविधान दिवस", category: "nepal-public" },
  { date: "2026-10-18", name: "Maha Ashtami", nameNp: "महा अष्टमी", category: "nepal-public" },
  { date: "2026-10-19", name: "Dashain holiday", nameNp: "दशैं बिदा", category: "nepal-public" },
  { date: "2026-10-20", name: "Maha Navami", nameNp: "महा नवमी", category: "nepal-public" },
  { date: "2026-10-21", name: "Vijaya Dashami", nameNp: "विजया दशमी", category: "nepal-public" },
  { date: "2026-10-23", name: "Dashain holiday / Pradosh Vrat", nameNp: "दशैं बिदा / प्रदोष व्रत", category: "nepal-public" },
  { date: "2026-10-25", name: "Kojagrat Purnima", nameNp: "कोजाग्रत पूर्णिमा", category: "nepal-festival" },
  { date: "2026-11-07", name: "Kaag Tihar", nameNp: "काग तिहार", category: "nepal-festival" },
  { date: "2026-11-08", name: "Kukur Tihar / Laxmi Puja", nameNp: "कुकुर तिहार / लक्ष्मी पूजा", category: "nepal-festival" },
  { date: "2026-11-09", name: "Gai Tihar", nameNp: "गाई तिहार", category: "nepal-festival" },
  { date: "2026-11-10", name: "Govardhan Puja / Mha Puja / Nepal Sambat New Year", nameNp: "गोवर्धन पूजा / म्ह पूजा / नेपाल संवत् नयाँ वर्ष", category: "nepal-festival" },
  { date: "2026-11-11", name: "Bhai Tika", nameNp: "भाइटीका", category: "nepal-festival" },
  { date: "2026-11-12", name: "Tihar holiday", nameNp: "तिहार बिदा", category: "nepal-public" },
  { date: "2026-11-15", name: "Chhath", nameNp: "छठ", category: "nepal-festival" },
  { date: "2026-12-25", name: "Christmas Day", nameNp: "क्रिसमस डे", category: "nepal-public" },
  { date: "2027-01-01", name: "Gregorian New Year", nameNp: "अंग्रेजी नयाँ वर्ष", category: "international-observance" },
  { date: "2027-01-15", name: "Maghe Sankranti", nameNp: "माघे सङ्क्रान्ति", category: "nepal-public" },
  { date: "2027-01-30", name: "Martyrs' Day", nameNp: "शहीद दिवस", category: "nepal-public" },
  { date: "2027-02-14", name: "Valentine's Day", nameNp: "भ्यालेन्टाइन डे", category: "international-observance" },
  { date: "2027-02-19", name: "Democracy Day", nameNp: "प्रजातन्त्र दिवस", category: "nepal-public" },
  { date: "2027-03-08", name: "International Women's Day", nameNp: "अन्तर्राष्ट्रिय महिला दिवस", category: "international-observance" },
  { date: "2027-03-22", name: "Holi / Fagu Purnima", nameNp: "होली / फागु पूर्णिमा", category: "nepal-festival" },
  { date: "2026-10-31", name: "Halloween", nameNp: "हेलोविन", category: "international-observance" },
  { date: "2027-03-28", name: "Easter Sunday", nameNp: "इस्टर आइतबार", category: "international-observance" },
];