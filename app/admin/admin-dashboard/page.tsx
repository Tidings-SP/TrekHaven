"use client"
import { auth, db } from "@/app/authentication/firebase";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import TopNavBar from "@/components/navbar/top-navbar";
import { Button } from "@/components/ui/button";
import ReportMetrics from "./report";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";




export default function AdminDashboard() {

  const [uid, setUid] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {

        setUid(authUser.uid)
      } else {
        router.push("/authentication/signin")
      }
    });

    // Cleanup the subscription when unmounting
    return () => unsubscribe();
  });
  const router = useRouter();
  const [stays, setStays] = useState<{
    id: string;
    name: string;
    desc: string;
    ref: string;
  }[]>([]);
  const fetch = (uid: any) => {

    if (uid) {

      const q = query(collection(db, "hotels"), where("createrid", "==", uid));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setStays(
          querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, desc: doc.data().desc, ref: doc.data().ref }))
        );
      });

      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }

  useEffect(() => {
    if (uid !== null) {
      fetch(uid); // Call the function when uid is not null
    }
  }, [uid]);

  function handleOnClick(id: string, option: string) {
    if (option === "view") {
      router.push(`/home/stays/stay-detail?id=${id}`)

    } else {
      router.push(`/admin/new-stay?id=${id}`)

    }
  }
  const [confirmation, setConfirmation] = useState('')
  async function deleteStay(id: string, option: string) {
    if ("Delete" === confirmation && option === "delete") {
      await deleteDoc(doc(db, "hotels", id))
      toast({
        title: "Stay Removed Successfully."
      })
    } else if ("Delete" != confirmation && option === "delete") {
      toast({
        title: "Type 'Delete' to remove the stay!",
        variant: "destructive"
      })
    }
    setConfirmation('')
  }

  return (
    <>
      <TopNavBar />
      <div className="container mx-auto py-8 px-8">
        <ReportMetrics />
        <h1 className="text-2xl font-bold pb-3 pt-8">Manage Your Stay!</h1>

        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
          {stays.map(card => (
            <div
              className="shadow-lg rounded-lg"
              key={card.id}
            >
              <div
                onClick={() => handleOnClick(card.id, "view")}

                className="flex items-center justify-center cursor-pointer">
                <div className="flex w-[100%] h-[100%] overflow-hidden items-center justify-center">

                  <Image
                    className="rounded-lg"
                    src={card.ref}
                    width={240}
                    height={240}
                    alt="Picture posted by the author"></Image>
                </div>
              </div>
              <div
                onClick={() => handleOnClick(card.id, "view")}

                className="p-5 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{card.name}</h3>
                <p className="text-lg font-normal line-clamp-2">{card.desc}</p>
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-stretch p-5 gap-2">

                  <Button
                    onClick={() => handleOnClick(card.id, "edit")}
                    className="w-[100%]" variant={"secondary"}>Edit</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete 💀</DialogTitle>
                        <DialogDescription>
                          Type **Delete** to continue...
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                          <Label htmlFor="Delete" className="sr-only">
                            Delete
                          </Label>
                          <Input
                            id="Delete"
                            onChange={(e) => setConfirmation(e.target.value)}
                          />
                        </div>
                        <DialogClose asChild>

                          <Button
                            onClick={() => deleteStay(card.id, "delete")}
                            type="button" variant={"destructive"} className="px-3">
                            Delete
                          </Button>
                        </DialogClose>
                      </div>
                      <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                          <Button
                            onClick={() => deleteStay("", "close")}

                            type="button" variant="secondary">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex px-5 ">

                  <Button
                    className="w-full"
                    onClick={() => router.push(`/admin/admin-dashboard/user-data?id=${card.id}`)}

                    variant={"secondary"}>Customer Data</Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
      <Toaster />

    </>
  )
}