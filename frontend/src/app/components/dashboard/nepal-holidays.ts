export type NepalHoliday = {
  date: string;
  name: string;
  nameNp?: string;
  region?: "national" | "kathmandu-valley";
};

// Major public and cultural holidays for BS 2083 (2026–27).
// Gregorian dates let the same event appear in both AD and BS calendar modes.
// This is intentionally a starter set, not a complete holiday calendar. Keep it
// aligned with the Ministry of Home Affairs notice and Kathmandu Metropolitan
// City's calendar; some holidays vary by region/community.
export const NEPAL_HOLIDAYS: NepalHoliday[] = [
  { date: "2026-04-14", name: "Nepali New Year", nameNp: "नेपाली नयाँ वर्ष" },
  { date: "2026-05-01", name: "Buddha Jayanti / Labour Day", nameNp: "बुद्ध जयन्ती / मजदुर दिवस" },
  { date: "2026-05-29", name: "Republic Day", nameNp: "गणतन्त्र दिवस" },
  { date: "2026-08-28", name: "Janai Purnima / Raksha Bandhan", nameNp: "जनै पूर्णिमा / रक्षा बन्धन" },
  { date: "2026-09-19", name: "Constitution Day", nameNp: "संविधान दिवस" },
  { date: "2026-10-18", name: "Maha Ashtami", nameNp: "महा अष्टमी" },
  { date: "2026-10-19", name: "Dashain holiday", nameNp: "दशैं बिदा" },
  { date: "2026-10-20", name: "Maha Navami", nameNp: "महा नवमी" },
  { date: "2026-10-21", name: "Vijaya Dashami", nameNp: "विजया दशमी" },
  { date: "2026-10-23", name: "Dashain holiday", nameNp: "दशैं बिदा" },
  { date: "2026-10-25", name: "Kojagrat Purnima", nameNp: "कोजाग्रत पूर्णिमा" },
  { date: "2026-11-08", name: "Laxmi Puja", nameNp: "लक्ष्मी पूजा" },
  { date: "2026-11-09", name: "Gai Tihar", nameNp: "गाई तिहार" },
  { date: "2026-11-10", name: "Govardhan Puja / Mha Puja", nameNp: "गोवर्धन पूजा / म्ह पूजा" },
  { date: "2026-11-11", name: "Bhai Tika", nameNp: "भाइटीका" },
  { date: "2026-11-12", name: "Tihar holiday", nameNp: "तिहार बिदा" },
  { date: "2026-11-15", name: "Chhath", nameNp: "छठ" },
  { date: "2027-01-15", name: "Maghe Sankranti", nameNp: "माघे सङ्क्रान्ति" },
  { date: "2027-01-30", name: "Martyrs' Day", nameNp: "शहीद दिवस" },
  { date: "2027-02-19", name: "Democracy Day", nameNp: "प्रजातन्त्र दिवस" },
  { date: "2027-03-08", name: "International Women's Day", nameNp: "अन्तर्राष्ट्रिय महिला दिवस" },
  { date: "2027-03-22", name: "Holi / Fagu Purnima", nameNp: "होली / फागु पूर्णिमा" },
];
