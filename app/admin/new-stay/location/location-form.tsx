"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
import { toast, useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { auth, db } from "@/app/authentication/firebase"
import { DocumentReference, addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { type } from "os"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
let uid = auth.currentUser?.uid;
const locationFormSchema = z.object({
  doorno: z
    .string()
    .min(2, {
      message: "Door number must be at least 2 characters.",
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
    .min(2, {
      message: "State must be at least 2 characters.",
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
 

function authStatus() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true); // User is signed in
      } else {
        console.log("User Not signin");
        resolve(false); // User is not signed in
      }
    });
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is authenticated, update uid

    uid = user.uid;
    console.log(uid)
  }
});


async function fetchRef(id: any) {
  let ref: DocumentReference;

  ref = doc(db, "hotels", id);

  return ref;

}

async function setDatabase(
  id: any,
  doorno: string,
  area: string,
  street: string,
  city: string,
  state: string,
  country: string,
) {

  let isOk = false;
  if (id) {
    const docRef = doc(db, "hotels", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().createrid === uid) {

      isOk = true
    }
  } else {
    isOk = true
  }
  return new Promise(async (resolve) => {
    if (await authStatus() && isOk) {

      await updateDoc(await fetchRef(id), {
        doorno: doorno,
        area: area,
        street: street,
        city: city,
        state: state,
        country: country,

      }).then(() => {

        resolve(true);

      }).catch(
        (e) => {
          resolve(false);
        }
      );

    } else {
      resolve(false);
    }
  })



}

async function initialData(id: any) {


  if (id) {
    const docRef = doc(db, "hotels", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().createrid === uid) {
      return {
        doorno: docSnap.data().doorno,
        area: docSnap.data().area,
        street: docSnap.data().street,
        city: docSnap.data().city,
        state: docSnap.data().state,
        country: docSnap.data().country,

      };
    } else {
      return {
        doorno: "",
        area: "",
        street: "",
        city: "",
        state: "",
        country: "",
      };
    }
  } else {
    return {
      doorno: "",
        area: "",
        street: "",
        city: "",
        state: "",
        country: "",
    };
  }

}



export function LocationForm() {
  const { toast } = useToast()
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter()

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
  })

  const defaultValues = useWatch({ control: form.control });
  useEffect(() => {
    const fetchData = async () => {
      toast({
        title: "Filling Data from Draft..Please Wait!...",
      })
      const data = await initialData(id);
      form.setValue('doorno', data.doorno);
      form.setValue('area', data.area);
      form.setValue('street', data.street);
      form.setValue('city', data.city);
      form.setValue('state', data.state);
      form.setValue('country', data.country);
    };

    fetchData();
  }, [form, id, toast]);

  async function onSubmit(data: LocationFormValues) {
    const updateResult = await setDatabase(
      id, data.doorno, data.area, data.street, data.city, data.state, data.country
    );
    if (updateResult) {
      router.push(`/admin/new-stay/features?id=${id}`)
    } else (
      toast({
        title: "Something went wrong): Please Try Again! "
      })
    )
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

        <div className="flex gap-4">

          <Button type="submit">Save & Next Step</Button>
          <Button type="button"
            onClick={
              () => {
                router.push(`/admin/new-stay?id=${id}`)

              }
            }
            variant={"ghost"}>Go Back</Button>
        </div>
      </form>
      <Toaster/>
    </Form>
  )
}