"use client"
import { auth, db } from "@/app/authentication/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import img from "@/assets/imgSample.webp"
import { onAuthStateChanged } from "firebase/auth";
import TopNavBar from "@/components/navbar/top-navbar";
import { Button } from "@/components/ui/button";
import ReportMetrics from "./report";




export default function AdminDashboard() {

let uid = auth.currentUser?.uid;
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("called...  ")
    // User is authenticated, update uid
    uid = user.uid;
  }
});
  const router = useRouter();
  const [stays, setStays] = useState<{
    id: string;
    name: string;
    desc: string;
  }[]>([]);
  const fetchStays = (uid:any) => {
    console.log(uid)
    
    if(uid){

      const q = query(collection(db, "hotels"), where("createrid", "==", uid));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setStays(
          querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, desc: doc.data().desc }))
        );
      });
  
      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }

  useEffect(() => {
    if (uid !== null) {
      fetchStays(uid); // Call the function when uid is not null
    }
  }, [uid]);

  function handleOnClick(id: string, option: string) {
    if (option === "view") {
      router.push(`/home/stays/stay-detail?id=${id}`)

    } else {
      router.push(`/admin/new-stay?id=${id}`)

    }
  }

  return (
    <>
      <TopNavBar />
      <div className="container mx-auto py-8 px-8">
        <ReportMetrics/>
        <h1 className="text-2xl font-bold pb-3 pt-8">Manage Your Stay!</h1>

        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
          {stays.map(card => (
            <div
              className="shadow-lg rounded-lg"
              key={card.id}
            >
              <Image
                className="rounded-lg"
                src={img}
                alt="Picture of the author"></Image>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{card.name}</h3>
                <p className="text-lg font-normal line-clamp-2">{card.desc}</p>
              </div>

              <div className="flex justify-between items-stretch p-5 gap-2">
                <Button
                  onClick={() => handleOnClick(card.id, "edit")}
                  className="w-[100%]" variant={"secondary"}>Edit</Button>
                <Button
                  onClick={() => handleOnClick(card.id, "view")}
                  className="w-[55%]" variant={"secondary"}>View</Button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </>
  )
}