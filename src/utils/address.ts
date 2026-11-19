import { Address } from "@/types/order";
import { Country, State } from "country-state-city";

export const getAddressString = (address: Address) => {
  let stringAddress = `${address.line1}`;
  if (address.line2) stringAddress += `, ${address.line2}`;

  const country = Country.getCountryByCode(address.country);
  const state = State.getStateByCodeAndCountry(address.state, address.country);
  const zip = address.zip.toString();

  if (country) stringAddress += `, ${country.name}`;
  if (state) stringAddress += `, ${state.name}`;
  if (address.city) stringAddress += `, ${address.city}`;

  stringAddress += `, ${zip}`;
  return stringAddress;
};

// "+358-18" -> "358"
export const getDialCode = (countryCode?: string) =>
  Country.getCountryByCode(countryCode ?? "")
    ?.phonecode.replace(/^\+/, "")
    .split("-")[0];

// Customers type the number without the country code (it's shown as a prefix); store it with one
export const withDialCode = (phone: string, dialCode?: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+") || !dialCode) return cleaned;
  const digits = cleaned.replace(/^0+/, "");
  return digits.startsWith(dialCode) && digits.length > 10 ? `+${digits}` : `+${dialCode}${digits}`;
};
