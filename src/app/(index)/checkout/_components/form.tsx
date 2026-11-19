"use client";

import { z } from "zod";
import { FieldPath, useFormContext } from "react-hook-form";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Panel } from "@/components/misc/Panel";
import { customerSchema } from "@/schemas";

export const orderFormSchema = customerSchema.extend({
  couponCode: z.string(),
  referralSource: z.string().min(1, "Please select how you heard about us").max(100),
});
export type OrderFormValues = z.infer<typeof orderFormSchema>;
export const contactSchema = orderFormSchema.pick({ email: true, name: true, phone: true });

/** The checkout form's react-hook-form instance (the page wraps everything in <Form>) */
export const useOrderForm = () => useFormContext<OrderFormValues>();

export const fieldClassName =
  "h-12 rounded-xl bg-background md:text-base focus-visible:ring-bandit-orange focus:ring-bandit-orange";

// Enter in a field would submit the whole order
export const preventEnter = (e: React.KeyboardEvent) => e.key === "Enter" && e.preventDefault();

export const RequiredStar = () => <span className="text-bandit-orange ml-1">*</span>;

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel className="text-muted-foreground font-normal">
    {children}
    <RequiredStar />
  </FormLabel>
);

export const Step = ({
  n,
  title,
  done,
  children,
}: {
  n: string;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) => (
  <section>
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-calera text-4xl leading-[0.8] text-bandit-orange">{n}</span>
      <h2 className="font-calera uppercase text-2xl md:text-3xl leading-[0.9]">{title}</h2>
      {done && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-500">
          <CheckIcon className="w-3.5 h-3.5" /> done
        </span>
      )}
    </div>
    <Panel>{children}</Panel>
  </section>
);

type TextFieldProps = {
  name: FieldPath<OrderFormValues>;
  label: string;
  required?: boolean;
  className?: string;
  hint?: React.ReactNode;
  onTextChange?: (value: string) => void;
} & Omit<React.ComponentProps<"input">, "name" | "className">;

export const TextField = ({
  name,
  label,
  required = true,
  className,
  hint,
  onTextChange,
  ...inputProps
}: TextFieldProps) => {
  const { control } = useOrderForm();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-muted-foreground font-normal">
            {label}
            {required ? <RequiredStar /> : <span className="opacity-60 ml-1">(optional)</span>}
          </FormLabel>
          <FormControl>
            <Input
              className={fieldClassName}
              onKeyDown={preventEnter}
              {...inputProps}
              {...field}
              value={field.value as string}
              onChange={e => {
                field.onChange(e);
                onTextChange?.(e.target.value);
              }}
            />
          </FormControl>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
