"use client";

import { useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { Country, State } from "country-state-city";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validatePincode } from "@/lib/pincode";
import { CONTACT } from "@/lib/site";
import { fieldClassName, FieldLabel, Step, TextField, useOrderForm } from "./form";

const countries = Country.getAllCountries();
const indianStates = State.getStatesOfCountry("IN");
const PINCODE_DEBOUNCE_MS = 700;

export const AddressStep = ({ done }: { done: boolean }) => {
  const form = useOrderForm();
  const country = useWatch({ control: form.control, name: "address.country" }) ?? "";
  const isIndia = country === "IN";
  const countryStates = country ? State.getStatesOfCountry(country) : [];
  const [pincodePlace, setPincodePlace] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // autofill: typing the pincode fills in state + city; picking a state only checks it against the pincode
  const checkPostalCode = (postalCode: string, autofill: boolean) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (autofill) setPincodePlace(null);
    debounceRef.current = setTimeout(async () => {
      if (isIndia) {
        const pincodeResponse = await validatePincode(postalCode).catch(() => null);
        if (!pincodeResponse) return; // lookup API down: don't block checkout
        if (!pincodeResponse.isValid) {
          form.setError("address.zip", { message: "Invalid Pincode", type: "validate" });
          return;
        }

        const { state: pinStateName, city } = pincodeResponse.data;
        const pinState = indianStates.find(s => s.name.toLowerCase() === pinStateName.toLowerCase());

        if (autofill && pinState) {
          form.setValue("address.state", pinState.isoCode, { shouldValidate: true });
          if (!form.getValues().address.city) form.setValue("address.city", city, { shouldValidate: true });
          setPincodePlace(`${city}, ${pinState.name}`);
        } else {
          const selectedState = State.getStateByCodeAndCountry(form.getValues().address.state, country);
          if (selectedState && pinStateName.toLowerCase() !== selectedState.name.toLowerCase()) {
            form.setError("address.zip", { message: `Not a ${selectedState.name} pincode`, type: "validate" });
            return;
          }
        }
      } else if (!postalCode || postalCode.length < 3) {
        form.setError("address.zip", { message: "Invalid postal code", type: "validate" });
        return;
      }

      form.resetField("address.zip", {
        keepDirty: true,
        keepError: false,
        keepTouched: true,
        defaultValue: postalCode,
      });
    }, PINCODE_DEBOUNCE_MS);
  };

  return (
    <Step n="02" title="Where to?" done={done}>
      <div className="p-4 md:p-5 grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="address.country"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FieldLabel>Country</FieldLabel>
              <FormControl>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                    setPincodePlace(null);
                    form.setValue("address.state", "", { shouldValidate: true });
                    form.setValue("address.zip", "", { shouldValidate: true });
                  }}
                  defaultValue={field.value}
                  {...field}>
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextField
          name="address.zip"
          label={isIndia ? "Pincode" : "Postal code"}
          autoComplete="postal-code"
          inputMode={isIndia ? "numeric" : undefined}
          placeholder={isIndia ? "6 digits" : "Postal code"}
          className="col-span-2 sm:col-span-1"
          onTextChange={v => checkPostalCode(v, true)}
          hint={
            !isIndia ? null : pincodePlace ? (
              <span className="text-green-500">✓ {pincodePlace}</span>
            ) : (
              "We'll fill in your city and state."
            )
          }
        />

        <TextField
          name="address.line1"
          label="House / flat, street"
          autoComplete="address-line1"
          className="col-span-2"
        />
        <TextField
          name="address.line2"
          label="Landmark, area"
          required={false}
          autoComplete="address-line2"
          className="col-span-2"
        />
        <TextField name="address.city" label="City" autoComplete="address-level2" />

        <FormField
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormItem>
              <FieldLabel>State</FieldLabel>
              <FormControl>
                <Select
                  onValueChange={v => {
                    form.setValue("address.state", v, { shouldValidate: true });
                    checkPostalCode(form.getValues().address.zip, false);
                  }}
                  defaultValue={field.value}
                  {...field}>
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryStates.map(state => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {!!country && !isIndia && (
        <div className="mx-4 md:mx-5 mb-4 md:mb-5 p-4 rounded-2xl border border-dashed border-bandit-orange/60 bg-bandit-orange/10 text-sm text-muted-foreground leading-relaxed">
          <p className="font-calera uppercase text-2xl text-foreground mb-1">Shipping abroad? Sorted.</p>
          <p>International orders are priced by hand so you never overpay on shipping or customs.</p>
          <ol className="list-decimal pl-5 mt-2 space-y-0.5">
            <li>Place the order now, no payment yet.</li>
            <li>
              Within <strong className="text-foreground">24 hours</strong> you get an email from{" "}
              <strong className="text-foreground">{CONTACT.email}</strong> with exact shipping and duties.
            </li>
            <li>Pay through the secure link. Delivery takes 7–14 business days.</li>
          </ol>
        </div>
      )}
    </Step>
  );
};
