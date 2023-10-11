"use client"
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import img from "@/assets/imgSample.webp"
import { auth, db } from "@/app/authentication/firebase";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Ratings from "./ratings/page";
import RatingsFragment from "./ratings/page";
import { Star } from "lucide-react";
import { BsStarFill } from "react-icons/bs";
import { Rating } from "react-simple-star-rating";
import { onAuthStateChanged } from "firebase/auth";
const Razorpay = require('razorpay');

type Stay = {
  id: string;
  createrid:string;
  name: string;
  desc: string;
  price: number;
  rate: number;
};
async function add(uid:string, hid:string, createrid:string,pid:string,price:number, status:string) {
  await addDoc(collection(db, "history"), {
    userid:uid,
    createrid:createrid,
    price: price,
    pid:pid,
    hotelid:hid,
    time:new Date().toLocaleString(),
    status:status,
  });
}
export default function StayDetail() {
  const [stay, setStay] = useState<Stay | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  let uid:string;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("called...  ")
      // User is authenticated, update uid
      uid = user.uid;
    }
  });
  useEffect(() => {
    async function fetchStay() {
      if (id) {
        const stayRef = doc(db, "hotels", id);
        const docSnapshot = await getDoc(stayRef);

        if (docSnapshot.exists()) {
          const stayData = docSnapshot.data();
          console.log(stayData.rate)
          if (stayData) {
            setStay({
              id: docSnapshot.id,
              createrid:stayData.createrid,
              name: stayData.name,
              desc: stayData.desc,
              price: stayData.price,
              rate: stayData.rate
            });
          }
        }
      }

    }

    fetchStay();
  }, [id]);
  


  const [amount, setAmount] = useState(1);



  const handlePayment = async () => {
    const res = await initializeRazorpay();
    if (!res) {
      alert("Razorpay SDK Failed to load");
      return;
    }

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
          add(uid, stay.id, stay.createrid, response.razorpay_payment_id, stay.price, "success")
          alert(response.razorpay_payment_id);

        },
        prefill: {
          name: "TrekHavel",
          email: "TrekHaven@example.com",
          contact: "3333333333",
        },



      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        add(uid, stay.id, stay.createrid, response.error.metadata.payment_id, stay.price, "fail")
        alert(response.error.code);
        alert(response.error.reason);
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

          <h6 className='text-2xl font-semibold mt-2 ms-2'>Room Count</h6>
          <div className='flex flex-row items-center gap-12'>

            <div className='flex flex-row items-center'>
              <Button className='bg-secondary-foreground py-2 px-5 rounded-lg  text-3xl' onClick={() => setAmount((prev) => prev - 1)}>-</Button>
              <span className='py-4 px-6 rounded-lg'>{amount}</span>
              <Button className='bg-secondary-foreground py-2 px-4 rounded-lg text-3xl' onClick={() => setAmount((prev) => prev + 1)}>+</Button>
            </div>
            <Button onClick={handlePayment} className=' text-white font-semibold py-3 px-16 rounded-xl h-full'>Book Now</Button>
          </div>

          <h6 className='flex items-center text-xl font-semibold mt-2 ms-2'>Overall Rating:
            <Rating
            className="mb-1"
              size={25}
              initialValue={stay?.rate}
              readonly={true}
              SVGclassName="inline-block"
            /></h6>
        </div>



      </div>
      {/* Reviews & Ratings*/}
      {id && <RatingsFragment hid={id} />}


    </>
  )
}