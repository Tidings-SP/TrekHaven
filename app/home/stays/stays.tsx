"use client"
import Image from "next/image";
import img from "@/assets/imgSample.webp"
import { useEffect, useState } from "react";
import { onSnapshot, query, where, collection } from "firebase/firestore";
import { db } from "@/app/authentication/firebase";
import StayDetail from "./stay-detail/page";
import { useRouter } from "next/navigation";


export default function Stays() {
  const router = useRouter();
  const [stays, setStays] = useState<{ id: string; name: string; desc: string }[]>([]);

  useEffect(() => {
    const q = query(collection(db, "hotels"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setStays(
        querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, desc: doc.data().desc}))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  function handleOnClick(id:string) {
    
    router.push(`/home/stays/stay-detail?id=${id}`)
  }

  return(
    <main className="container mx-auto py-8 px-8">
      <h1 className="text-4xl font-bold pb-3">Find Best Stays!</h1>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
        {stays.map(card => (
          <div
          className="shadow-lg rounded-lg" 
          key={card.id}
          onClick={() => handleOnClick(card.id)} >
            <Image
            className="rounded-lg"
            src={img}
            alt="Picture of the author"></Image>
            <div className="p-5">
            <h3 className="text-3xl font-bold mb-3">{card.name}</h3>
            <p className="text-lg font-normal">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
    
  )
}