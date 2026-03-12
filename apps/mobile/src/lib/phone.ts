import { appConfig } from "./config";

export function cleanPhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export function toE164Phone(value: string) {
  return `${appConfig.countryCode}${cleanPhoneDigits(value)}`;
}

export function formatPhonePreview(value: string) {
  const digits = cleanPhoneDigits(value);

  if (digits.length !== 10) {
    return `${appConfig.countryCode} ${digits}`;
  }

  return `${appConfig.countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
