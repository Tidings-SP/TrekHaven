"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

const items = [
  {
    id: "Air Conditioning",
    label: "Air Conditioning",
  },
  {
    id: "Kitchen",
    label: "Kitchen",
  },
  {
    id: "Wifi",
    label: "Wifi",
  },
  {
    id: "Heating",
    label: "Heating",
  },
  {
    id: "TV",
    label: "TV",
  },
  {
    id: "Pool",
    label: "Pool",
  },
] as const
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];
const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  image: z
  .any()
//   .refine((files) => {
//     return files?.size <= MAX_FILE_SIZE;
//  }, `Max image size is 5MB.`)
//  .refine(
//    (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
//    "Only .jpg, .jpeg, .png and .webp formats are supported."
//  ),
,
  price: z
    .any()
    .refine((p) => p >= 100, `Price should be minimum of 100`),
  
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

// This come from  database.
const defaultValues: Partial<DisplayFormValues> = {
  items: ["TV"],
}

export function FeaturesForm() {
  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues,
  })
  

  function onSubmit(data: DisplayFormValues) {
    console.log(data);
    
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

      <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image of your stay</FormLabel>
              <FormControl>
              <Input  type="file" {...field}/>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Amenities</FormLabel>
                <FormDescription>
                  Select the items you are offering in your stay.
                </FormDescription>
              </div>
              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="items"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="100..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Publish</Button>
      </form>
    </Form>
  )
}