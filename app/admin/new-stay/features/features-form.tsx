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
import { toast, useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { useRouter, useSearchParams } from "next/navigation"
import { DocumentReference, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db, storage } from "@/app/authentication/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useState } from "react"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
let uid = auth.currentUser?.uid;

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

  roomcount: z
    .any()
    .refine((p) => p >= 1, `Room count should be minimum of 1`),

})

type DisplayFormValues = z.infer<typeof displayFormSchema>

// This come from  database.
const defaultValues: Partial<DisplayFormValues> = {
  items: ["TV", "Wifi"],
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
  price: number,
  roomcount: number,
  items: string[],
  ref: string|undefined,

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
        price: Number(price),
        roomcount: Number(roomcount),
        items: items,
        ispublished: true,
        rate: "0",
        ref: ref,
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



export function FeaturesForm() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter()
  const [img, setImg] = useState<File>();



  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues,
  })

  function uploadImg() {
   

  }

  async function onSubmit(data: DisplayFormValues) {

    if (!img) {
      toast({
        title: "Image is not uploaded, Please Try again!",
        variant: "destructive",
      })
      return;
    }
    const imgRef = ref(storage, `hotels/${img.name}`);

    uploadBytes(imgRef, img).then(
      (snapshot) => {
        getDownloadURL(snapshot.ref).then(async (url) => {
          const updateResult = await setDatabase(
            id, data.price, data.roomcount, data.items, url,
          );
          if (updateResult) {
            router.push("/")
          } else (
            toast({
              title: "Something went wrong): Please Try Again! "
            })
          )
        })
      }
    ).catch(() => {
      toast({
        title: "Image is not uploaded, Please Try again!",
        variant: "destructive",
      })
      return;
    }
    )

    
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
                <Input type="file"
                  onChange={(e) => field.onChange(() => {
                    if (e.target.files) {
                      setImg(e.target.files[0])
                    }
                  })
                  }
                />
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
          name="roomcount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Count</FormLabel>
              <FormControl>
                <Input placeholder="6..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Per Room</FormLabel>
              <FormControl>
                <Input placeholder="100..." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">

          <Button type="button"
            onClick={
              () => {
                router.push(`/admin/new-stay/location?id=${id}`)

              }
            }
            variant={"ghost"}>Go Back</Button>
          <Button type="submit">Publish</Button>
        </div>
      </form>
      <Toaster />
    </Form>
  )
}
