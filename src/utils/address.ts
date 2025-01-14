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

  stringAddress += `, ${zip}`;
  return stringAddress;
};
