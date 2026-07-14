export interface Country {
  code: string;
  name: string;
  nameAr: string;
  phoneCode: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  timezone: string;
  paymentMethods: string[];
}

export const COUNTRIES: Country[] = [
  { code: "EG", name: "Egypt", nameAr: "مصر", phoneCode: "+20", currencyCode: "EGP", currencySymbol: "E£", locale: "ar-EG", timezone: "Africa/Cairo", paymentMethods: ["Vodafone Cash", "Fawry", "Instapay", "Credit Card"] },
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", phoneCode: "+966", currencyCode: "SAR", currencySymbol: "﷼", locale: "ar-SA", timezone: "Asia/Riyadh", paymentMethods: ["Mada", "Apple Pay", "Credit Card"] },
  { code: "AE", name: "UAE", nameAr: "الإمارات", phoneCode: "+971", currencyCode: "AED", currencySymbol: "د.إ", locale: "ar-AE", timezone: "Asia/Dubai", paymentMethods: ["Apple Pay", "Credit Card", "Samsung Pay"] },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", phoneCode: "+965", currencyCode: "KWD", currencySymbol: "د.ك", locale: "ar-KW", timezone: "Asia/Kuwait", paymentMethods: ["KNET", "Credit Card"] },
  { code: "QA", name: "Qatar", nameAr: "قطر", phoneCode: "+974", currencyCode: "QAR", currencySymbol: "ر.ق", locale: "ar-QA", timezone: "Asia/Qatar", paymentMethods: ["Credit Card", "Apple Pay"] },
  { code: "JO", name: "Jordan", nameAr: "الأردن", phoneCode: "+962", currencyCode: "JOD", currencySymbol: "د.ا", locale: "ar-JO", timezone: "Asia/Amman", paymentMethods: ["eFAWATEERcom", "Credit Card"] },
  { code: "IQ", name: "Iraq", nameAr: "العراق", phoneCode: "+964", currencyCode: "IQD", currencySymbol: "ع.د", locale: "ar-IQ", timezone: "Asia/Baghdad", paymentMethods: ["Zain Cash", "Credit Card"] },
  { code: "LY", name: "Libya", nameAr: "ليبيا", phoneCode: "+218", currencyCode: "LYD", currencySymbol: "د.ل", locale: "ar-LY", timezone: "Africa/Tripoli", paymentMethods: ["Credit Card"] },
  { code: "DZ", name: "Algeria", nameAr: "الجزائر", phoneCode: "+213", currencyCode: "DZD", currencySymbol: "د.ج", locale: "ar-DZ", timezone: "Africa/Algiers", paymentMethods: ["CIB", "Credit Card"] },
  { code: "MA", name: "Morocco", nameAr: "المغرب", phoneCode: "+212", currencyCode: "MAD", currencySymbol: "د.م", locale: "ar-MA", timezone: "Africa/Casablanca", paymentMethods: ["CMI", "Credit Card"] },
  { code: "SD", name: "Sudan", nameAr: "السودان", phoneCode: "+249", currencyCode: "SDG", currencySymbol: "ج.س", locale: "ar-SD", timezone: "Africa/Khartoum", paymentMethods: ["Bankak", "Credit Card"] },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", phoneCode: "+44", currencyCode: "GBP", currencySymbol: "£", locale: "en-GB", timezone: "Europe/London", paymentMethods: ["Stripe", "PayPal", "Apple Pay"] },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", phoneCode: "+1", currencyCode: "USD", currencySymbol: "$", locale: "en-US", timezone: "America/New_York", paymentMethods: ["Stripe", "PayPal", "Apple Pay"] },
  { code: "CA", name: "Canada", nameAr: "كندا", phoneCode: "+1", currencyCode: "CAD", currencySymbol: "C$", locale: "en-CA", timezone: "America/Toronto", paymentMethods: ["Stripe", "PayPal"] },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryCurrency(countryCode: string): { code: string; symbol: string } {
  const country = getCountryByCode(countryCode);
  return { code: country?.currencyCode ?? "USD", symbol: country?.currencySymbol ?? "$" };
}
