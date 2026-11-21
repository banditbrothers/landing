"use client";

import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { REFERRAL_SOURCES } from "@/constants/order";
import { FieldLabel, Step, useOrderForm } from "./form";

export const ReferralStep = ({ done }: { done: boolean }) => {
  const { control } = useOrderForm();
  return (
    <Step n="03" title="One last thing" done={done}>
      <FormField
        control={control}
        name="referralSource"
        render={({ field }) => (
          <FormItem className="p-4 md:p-5">
            <FieldLabel>How did you find us?</FieldLabel>
            <div className="flex flex-wrap gap-2 pt-1" role="radiogroup">
              {REFERRAL_SOURCES.map(source => {
                const on = field.value === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => field.onChange(source.id)}
                    className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      on
                        ? "bg-bandit-orange border-bandit-orange text-black font-semibold"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}>
                    {source.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Helps us spend less on ads and more on designs 🧡</p>
            <FormMessage />
          </FormItem>
        )}
      />
    </Step>
  );
};
