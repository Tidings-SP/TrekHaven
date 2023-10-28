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
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/toaster"
import { NEVER } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  pincode: z.string().min(6).max(6),
  area: z
    .string({
      required_error: "Please select your area.",
    }),
  street: z
    .string()
    .min(3, {
      message: "Street Addr must be at least 3 characters.",
    })
    .max(30, {
      message: "Street Addr not be longer than 30 characters.",
    }),
  
  
  


})

type LocationFormValues = z.infer<typeof locationFormSchema>

async function addr(pin: any) {
  const data = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  return await data.json()
}

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
  pincode: string,
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
        pincode: pincode,
        country: "India",

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
        street: docSnap.data().street,
        pincode: docSnap.data().pincode,
        

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

  const [isValidPin, setIsValidPin] = useState(false)
  const [pin, setPin] = useState<string>()
  const [area, setArea] = useState<string[]>()
  const [loc, setLoc] = useState<{ state: string, district: string }>({state:"", district:""})

  useEffect(() => {
    addr(pin).then((res) => {
      if (res[0].Status === "Success") {
        console.log(res[0].PostOffice)
        setArea((res[0].PostOffice).map((item: any) => item.Name))
        setLoc({
          state: res[0].PostOffice[0].State,
          district: res[0].PostOffice[0].District
        })
        setIsValidPin(true)
      } else {
        setLoc({
          state: "",
          district: ""
        })
        setArea([])
        setIsValidPin(false)
      }
    })

  }, [pin])

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
      form.setValue('street', data.street);
      form.setValue('pincode', data.pincode);
      setPin(data.pincode)
    };

    fetchData();
  }, [form, id, toast]);

  async function onSubmit(data: LocationFormValues) {

    if(!isValidPin) {
      toast({
        title:"Please make sure your have entered a valid pin!"
      })
      return;
    }
    const updateResult = await setDatabase(
      id, data.doorno, data.area, data.street, loc.district, loc.state, data.pincode
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
        {/* Door No*/}
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
        {/* street */}
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
        {/* Pin Code */}
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pin Code</FormLabel>
              <FormControl>
                <Input
                  tabIndex={-1}
                  type="number"
                  {...field} // Pass the form control field directly here
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    field.onChange(inputValue);
                    form.setValue('area', NEVER);
                    setPin(inputValue); // Update the 'pin' state
                  }}
                  onKeyDown={(event) => {
                    const inputElement = event.target as HTMLInputElement;
                    const key = event.key;

                    // Allow backspace (keyCode 8) and only digits if the limit is not reached
                    if (
                      (key === "Backspace" || /^\d$/.test(key)) &&
                      (inputElement.value.length < 6 || key === "Backspace")
                    ) {
                      return; // Allow the keypress
                    }

                    event.preventDefault(); // Prevent other key presses
                  }}
                  placeholder="Pin Code..." />
              </FormControl>
              <FormMessage />
              <h1 className="text-primary ms-4 text-sm">Your district {loc?.district} and state {loc?.state}</h1>
            </FormItem>
          )}
        />

        {/* Area */}
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger tabIndex={-1}>
                    <SelectValue placeholder="Select your area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {area?.map((a) => (
                    <SelectItem key={a} value={a}> {a} </SelectItem>

                  ))}


                </SelectContent>
              </Select>

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
      <Toaster />
    </Form>
  )
}