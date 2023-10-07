"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BellIcon, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { Rating } from 'react-simple-star-rating'
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { DocumentReference, addDoc, and, collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
interface RatingsProps {
  hid: string;
}
const uid = auth.currentUser?.uid;

const FormSchema = z.object({
  review: z
    .string()
    .min(5, {
      message: "Review must be at least 5 characters.",
    })
    .max(300, {
      message: "Review must not be longer than 300 characters.",
    }),
})
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
async function getDocRef(hid: string) {
  let rrRef: DocumentReference | null = null;
  const q = query(collection(db, "rr"), and(
    where("userid", "==", uid),
    where("hotelid", "==", hid)
  ));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    rrRef = doc.ref;
    if (rrRef) {
      console.log("Document reference found");
    }
  });

  if (rrRef) {
    return rrRef;
  } else {
    console.log("No matching document reference found, creating a new one");
    rrRef = await addDoc(collection(db, "rr"), { hotelid: hid, userid: uid, });
    return rrRef;
  }
}

async function setDatabase(hotelid: string, username: string, userreview: string) {
  if (await authStatus()) {


    await updateDoc(await getDocRef(hotelid), {
      hotelid: hotelid,
      userid: uid,
      username: username,
      userreview: userreview,
    });

  } else {
    console.log("User Not exist")
  }


}


const Ratings: React.FC<RatingsProps> = ({ hid }) => {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let name = auth.currentUser?.displayName;


    setDatabase(hid, name ? name : "Unknown Profile", data.review)

  }
  // Catch Rating value
  const handleRating = async (rate: number) => {

    if (await authStatus()) {


      await updateDoc(await getDocRef(hid), {
        userratings: rate,
      });

    } else {
      console.log("User Not exist:rate")
    }
  }

  const [rr, setRR] = useState<{ id: string, name: string; review: string; rating: number }[]>([]);

  useEffect(() => {
    const q = query(collection(db, "rr"), where("hotelid", "==", hid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setRR(
        querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().username, review: doc.data().userreview, rating: doc.data().userratings }))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, [hid]);


  return (
    <div className="p-8 flex">

      <Card className="sm:flex items-center">
        <CardHeader>
          <CardTitle>Review&apos;s and Rating</CardTitle>
          <CardDescription>Share Your experience!</CardDescription>

        </CardHeader>

        <CardContent className=" grid gap-6">




          <div className="-mx-2 flex items-centre space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-1">

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Drop your valuable review here!"
                            className="w-[100%]"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="-mx-2 flex flex-row items-centre space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">



                    <Rating
                      transition={true}
                      SVGclassName="inline-block"
                      onClick={handleRating}
                    />
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </Form>

            </div>
          </div>
          {
            rr.map(r => (
              <div key={r.id} className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <UserCircle2 className="mt-px h-[20%] w-[20%]" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{r.name }</p>
                  <Rating
                    size={15}
                    initialValue={r.rating}
                    readonly={true}
                    SVGclassName="inline-block"
                    onClick={handleRating}
                  />
                  <p className="text-sm text-muted-foreground">
                    {r.review}
                  </p>
                </div>
              </div>
            ))
          }

        </CardContent>

      </Card>
    </div>
  )
};

export default Ratings;