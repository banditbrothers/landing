"use client";

import { z } from "zod";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State, IState } from "country-state-city";
import { useEffect, useState } from "react";

const countries = Country.getAllCountries();

const orderFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Please enter a valid phone number",
  }),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    country: z.string(),
    state: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),
    city: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),
    zip: z.string().length(6, "Please enter a valid zip code"),
  }),
  products: z.array(
    z.object({
      designId: z.string(),
      quantity: z.number().gte(1, "Please enter a valid quantity"),
    })
  ),
});

export default function OrderPage() {
  const [states, setStates] = useState<IState[]>([]);

  const form = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
        country: "IN",
        state: "MH",
        city: "",
        zip: "",
      },
      products: [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const watchCountry = useWatch({
    control: form.control,
    name: "address.country",
  });

  useEffect(() => {
    if (watchCountry) {
      const countryStates = State.getStatesOfCountry(watchCountry);
      setStates(countryStates);
    }
  }, [watchCountry]);

  const onSubmit = (values: z.infer<typeof orderFormSchema>) => {
    console.log(values);
    // TODO: Implement order submission
  };

  return (
    <div className="mx-auto py-10 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Begin the Brotherhood</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+919876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.isoCode}
                                  value={country.isoCode}
                                >
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

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
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

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="400001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Submit Order
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
