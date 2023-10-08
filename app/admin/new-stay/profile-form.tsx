"use client"

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
import { auth, db } from "@/app/authentication/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { DocumentReference, addDoc, and, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
let uid = auth.currentUser?.uid;
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "name must be at least 2 characters.",
    })
    .max(60, {
      message: "name must not be longer than 60 characters.",
    }),

  bio: z.string().max(260).min(4),

})
type ProfileFormValues = z.infer<typeof profileFormSchema>

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

type Stay = {
  id: string;
  name: string;
  desc: string;
  price: number;
};

async function fetchRef(id: any) {
  let ref: DocumentReference | null = null;
  if (id) {
    ref = doc(db, "hotels", id);
  }
  if (ref) {
    return ref;
  } else {
    ref = await addDoc(collection(db, "hotels"), {
      createrid: uid,
      ispublished: false,
    });
    return ref;
  }
}

async function setDatabase(id: any, name: string, desc: string) {
  const docRef = doc(db, "hotels", id);
  const docSnap = await getDoc(docRef);
  let isOk = false;
  if (id) {
    if (docSnap.exists() && docSnap.data().createrid === uid) {

      isOk = true
    }
  } else {
    isOk = true
  }

  if (await authStatus() && isOk) {

    await updateDoc(await fetchRef(id), {

      name: name,
      desc: desc,
    });

  } else {
    console.log("User Not exist")
  }


}

async function initialData(id: any) {

  const docRef = doc(db, "hotels", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && docSnap.data().createrid === uid) {
    return {
      name: docSnap.data().name,
      bio: docSnap.data().desc,
    };
  } else {
    return {
      name: "",
      bio: "",
    };
  }
}


export function ProfileForm() {

  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  })

  const defaultValues = useWatch({ control: form.control });
  useEffect(() => {
    const fetchData = async () => {
      const data = await initialData(id);
      form.setValue('name', data.name);
      form.setValue('bio', data.bio);
      console.log("here...")
    };

    fetchData();
  }, [form, id]);


  function onSubmit(data: ProfileFormValues) {


    setDatabase(id, data.name, data.bio)


  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Cottage in MD"  {...field} />
              </FormControl>
              <FormDescription>
                This is your stay&apos;s public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about your stay"
                  className="resize-none"
                  {...field}
                />
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

