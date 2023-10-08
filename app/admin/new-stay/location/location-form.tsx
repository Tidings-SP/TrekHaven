"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const locationFormSchema = z.object({
  doorno: z
    .string()
    .min(3, {
      message: "Door number must be at least 3 characters.",
    })
    .max(10, {
      message: "Door number not be longer than 10 characters.",
    }),
  area: z
    .string()
    .min(3, {
      message: "Area must be at least 3 characters.",
    })
    .max(30, {
      message: "Area not be longer than 30 characters.",
    }),
  street: z
    .string()
    .min(3, {
      message: "Street Addr must be at least 3 characters.",
    })
    .max(30, {
      message: "Street Addr not be longer than 30 characters.",
    }),
  city: z
    .string()
    .min(3, {
      message: "City name must be at least 3 characters.",
    })
    .max(24, {
      message: "City name not be longer than 24 characters.",
    }),
  state: z
    .string()
    .min(3, {
      message: "State must be at least 3 characters.",
    })
    .max(20, {
      message: "State not be longer than 20 characters.",
    }),
  country: z
    .string()
    .min(3, {
      message: "Country name must be at least 3 characters.",
    })
    .max(20, {
      message: "Country name not be longer than 20 characters.",
    }),


})

type LocationFormValues = z.infer<typeof locationFormSchema>


export function LocationForm() {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    mode: "onChange",
  })



  function onSubmit(data: LocationFormValues) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="doorno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Door Number</FormLabel>
              <FormControl>
                <Input placeholder="58/A1..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <FormControl>
                <Input placeholder="Teppakulam..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input placeholder="Kamarajar street..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Madurai..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="Tamil Nadu..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="India..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit">Next Step</Button>
      </form>
    </Form>
  )
}