"use client";

import { useWatch } from "react-hook-form";
import { Country } from "country-state-city";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { getDialCode } from "@/utils/address";
import { FieldLabel, preventEnter, Step, TextField, useOrderForm } from "./form";

export const ContactStep = ({ done }: { done: boolean }) => {
  const { control } = useOrderForm();
  const country = useWatch({ control, name: "address.country" }) ?? "";
  const dialCode = getDialCode(country);
  const flag = Country.getCountryByCode(country)?.flag;

  return (
    <Step n="01" title="Who's this?" done={done}>
      <div className="p-4 md:p-5 grid sm:grid-cols-2 gap-4">
        <TextField
          name="email"
          label="Email"
          autoComplete="email"
          type="email"
          placeholder="you@email.com"
          className="sm:col-span-2"
        />
        <TextField name="name" label="Full name" autoComplete="name" />
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FieldLabel>Phone</FieldLabel>
              <div className="flex items-center h-12 rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-bandit-orange focus-within:border-bandit-orange">
                {dialCode && (
                  <span className="pl-3.5 pr-2.5 text-sm text-muted-foreground border-r border-border whitespace-nowrap">
                    {flag} +{dialCode}
                  </span>
                )}
                <FormControl>
                  <Input
                    autoComplete="tel-national"
                    type="tel"
                    placeholder={country === "IN" ? "98765 43210" : "Phone number"}
                    className="h-full border-0 shadow-none focus-visible:ring-0 md:text-base"
                    onKeyDown={preventEnter}
                    {...field}
                  />
                </FormControl>
              </div>
              <p className="text-xs text-muted-foreground">We&apos;ll send order updates on WhatsApp.</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Step>
  );
};
