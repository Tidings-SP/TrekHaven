"use client"
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import img from "@/assets/imgSample.webp"
import { db } from "@/app/authentication/firebase";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Ratings from "./ratings/page";
import RatingsFragment from "./ratings/page";
const Razorpay = require('razorpay');

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
  // const script = document.createElement('script');
  // script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  // script.async = true;
  // document.body.appendChild(script);

  const [amount, setAmount] = useState(1);



  const handlePayment = async () => {
    const res = await initializeRazorpay();
    console.log("Here...")
    if (!res) {
      alert("Razorpay SDK Failed to load");
      return;
    }

    // Make API call to the serverless API
    // const data = await fetch("/home/stays/stay-detail/api", { method: "POST" }).then((t) =>
    //   t.json()
    // );
    // console.log(data);
    if (stay) {
      var options = {
        key: "rzp_test_7iRQ8FI6FIOOsn",
        key_secret: 'BroTkDeQFB3d76yavmpxMQAZ',
        name: "Trex Haven",
        currency: "INR",
        amount: stay.price * 100,
        description: "Enjoy your stay!",
        handler: function (response: any) {
          // Validate payment at server - using webhooks is a better idea.
          alert(response.razorpay_payment_id);
          
        },
        prefill: {
          name: "TrekHavel",
          email: "TrekHaven@example.com",
          contact: "3333333333",
        },
        
         

      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response:any){
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
});
      paymentObject.open();
    }

  };


  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      // document.body.appendChild(script);

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };


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
            <Button onClick={handlePayment} className=' text-white font-semibold py-3 px-16 rounded-xl h-full'>Book Now</Button>
          </div>
          <h6 className='text-2xl font-semibold mt-2 ms-2'>Room Count</h6>

        </div>


      </div>
      {/* Reviews & Ratings*/}
      {id && <RatingsFragment hid={id} />}


    </>
  )
}