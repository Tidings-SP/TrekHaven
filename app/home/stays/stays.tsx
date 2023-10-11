"use client"
import Image from "next/image";
import img from "@/assets/imgSample.webp"
import { useEffect, useState } from "react";
import { onSnapshot, query, where, collection } from "firebase/firestore";
import { db } from "@/app/authentication/firebase";
import { useRouter } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";


export default function Stays() {
  const router = useRouter();
  const [stays, setStays] = useState<{ 
    id: string; 
    name: string; 
    desc: string;
    price: number;
    rate: number;
   }[]>([]);

  useEffect(() => {
    const q = query(collection(db, "hotels"), where("ispublished", "==", true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setStays(
        querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, desc: doc.data().desc, rate:doc.data().rate, price:doc.data().price }))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  function handleOnClick(id: string) {

    router.push(`/home/stays/stay-detail?id=${id}`)
  }

  return (
    <main className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold pb-3">Find Best Stays!</h1>
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
              <h3 className="text-xl font-bold mb-3 line-clamp-2">{card.name}</h3>
              <p className="text-lg font-normal line-clamp-2">{card.desc}</p>
            </div>
            <div className="flex text-xl justify-between p-5 m-4">
              <div className="flex float-left">₹ {card.price}</div>
              <div className="flex float-right items-center">{card.rate} <BsFillStarFill className="ms-3 mb-1" color="yellow"/></div>
            </div>
          </div>
        ))}
      </div>
    </main>

  )
}