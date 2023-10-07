"use client"
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import img from "@/assets/imgSample.webp"
import { db } from "@/app/authentication/firebase";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Ratings from "./ratings/page";

type Stay = {
  id: string;
  name: string;
  desc: string;
  price: number;
};

export default function StayDetail() {
  const [stay, setStay] = useState<Stay | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  
  useEffect(() => {
    async function fetchStay() {
      if (id) {
        const stayRef = doc(db, "hotels", id);
        const docSnapshot = await getDoc(stayRef);

        if (docSnapshot.exists()) {
          const stayData = docSnapshot.data();
          if (stayData) {
            setStay({
              id: docSnapshot.id,
              name: stayData.name,
              desc: stayData.desc,
              price: stayData.price,
            });
          }
        }
      }

    }

    fetchStay();
  }, [id]);


  const [amount, setAmount] = useState(1);
  return (
    <>
      <div className='flex flex-col justify-between lg:flex-row gap-16 lg:items-center p-5'>
        <div className='flex flex-col gap-6 lg:w-2/4'>
          <Image src={img} alt="" className='w-full h-full aspect-square object-cover rounded-xl' />

        </div>
        {/* ABOUT */}
        <div className='flex flex-col gap-4 lg:w-2/4'>
          <div>
            <span className=' text-primary font-semibold'>Royal Choice</span>
            <h1 className='text-3xl font-bold'>{stay?.name}</h1>
          </div>

          <p className='text-secondary-foreground'>
            {stay?.desc}
          </p>
          <h6 className='text-2xl font-semibold'>₹ {stay?.price}</h6>

          <div className='flex flex-row items-center gap-12'>
            <div className='flex flex-row items-center'>
              <Button className='bg-secondary-foreground py-2 px-5 rounded-lg  text-3xl' onClick={() => setAmount((prev) => prev - 1)}>-</Button>
              <span className='py-4 px-6 rounded-lg'>{amount}</span>
              <Button className='bg-secondary-foreground py-2 px-4 rounded-lg text-3xl' onClick={() => setAmount((prev) => prev + 1)}>+</Button>
            </div>
            <Button className=' text-white font-semibold py-3 px-16 rounded-xl h-full'>Book Now</Button>
          </div>
          <h6 className='text-2xl font-semibold mt-2 ms-2'>Room Count</h6>

        </div>

        
      </div>
      {/* Reviews & Ratings*/}
      {id && <Ratings hid={id} />}


    </>
  )
}