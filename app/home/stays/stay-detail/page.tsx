"use client"
import { Resend } from 'resend';
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/authentication/firebase";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import Ratings from "./ratings/page";
import RatingsFragment from "./ratings/page";
import { CalendarIcon, Star } from "lucide-react";
import { BsStarFill } from "react-icons/bs";
import { Rating } from "react-simple-star-rating";
import { onAuthStateChanged } from "firebase/auth";

import { addDays, format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from 'next/navigation';


type Stay = {
  id: string;
  createrid: string;
  name: string;
  desc: string;
  price: number;
  rate: number;
  ref: string;
  items: string[];
  state: string;
  country: string;

};
async function add(uid: string | undefined, hid: string, hname: string, createrid: string, pid: string, price: number, status: string) {
  await addDoc(collection(db, "history"), {
    userid: uid,
    createrid: createrid,
    hname: hname,
    price: price,
    pid: pid,
    hotelid: hid,
    time: new Date().toLocaleString(),
    status: status,
  });
}
export default function StayDetail() {
  const [amount, setAmount] = useState(0);
  const [stay, setStay] = useState<Stay | null>(null);
  const [disableDate, setDisableDate] = useState<Date[]>([]);
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter()
  const [uid, setUid] = useState<string>()
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, update uid
        setUid(user.uid);
      }
    });

    return () => unsubscribe();
  }, [])


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
              createrid: stayData.createrid,
              name: stayData.name,
              desc: stayData.desc,
              price: stayData.price,
              rate: stayData.rate,
              ref: stayData.ref,
              items: stayData.items,
              state: stayData.state,
              country: stayData.country,
            });
          }
        }
      }

    }

    fetchStay();
  }, [id]);

  useEffect(() => {
    getReservedDates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Define a ref for the Button element
  const popoverRef = useRef<HTMLButtonElement | null>(null);
  

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
        amount: amount * stay.price * 100,
        description: "Enjoy your stay!",
        handler:  function (response: any) {
          // Validate payment at server 
          add(uid, stay.id, stay.name, stay.createrid, response.razorpay_payment_id, amount * stay.price, "success")
          reserveDates();
          alert(response.razorpay_payment_id);
          router.push(`/home/stays/payment?id=${response.razorpay_payment_id}`)
        },
        prefill: {
          name: "TrekHavel",
          email: "TrekHaven@example.com",
          contact: "3333333333",
        },



      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        add(uid, stay.id, stay.name, stay.createrid, response.error.metadata.payment_id, amount * stay.price, "fail")
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


  //Get Creater Data
  const [cid, setCid] = useState('');
  const [phone, setPhone] = useState('');
  async function getCreaterData(stay: any) {
    if (stay) {
      const ref = doc(db, "user", stay.createrid);
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setCid(snap.data().username)
        setPhone(snap.data().userphone)
      }

    }

  }
  useEffect(() => {
    getCreaterData(stay)
  }, [stay])
  // date state
  const [range, setRange] = useState<any>([ // Use Range[] here
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 1),
      key: 'selection',
      status: false,
    }
  ]);
  const handleDateChange = (newRange: any) => {
    const newStartDate = newRange[0].startDate;

    if (newStartDate > addDays(new Date(), -1)) {
      newRange[0].status = true;
      setRange(newRange);
    }
  };
  function generateDateList(startDate: Date, endDate: Date) {
    const dateList = [];
    let currentDate = startDate;
    let count = 0;

    while (currentDate <= endDate) {
      dateList.push(currentDate);
      count += 1;
      currentDate = addDays(currentDate, 1);
    }
    setAmount(count)
    setDateList(dateList); // Set the generated date list in state
  };
  const [dateList, setDateList] = useState<Date[]>([]);
  useEffect(() => {
    generateDateList(range[0].startDate, range[0].endDate);
    console.log(range)
  }, [range])
  async function reserveDates() {
    if (id) {
      dateList.forEach((date) => {
        const ref = doc(db, 'hotels', id); // Replace with your actual collection and document
        console.log(date)
        updateDoc(ref, {
          reservedates: arrayUnion(date),
        });
      });
      if (uid) {
        await updateDoc(doc(db, 'user', uid), {
          historybooking: arrayUnion(id),
        })
      }

    }
  }
  async function getReservedDates() {
    if (id) {

      const snap = await getDoc(doc(db, "hotels", id));
      if (snap.exists()) {
        const timestamps = snap.data().reservedates;
        const dateList = timestamps.map((timestamp: { toDate: () => any; }) => {
          return timestamp.toDate(); // Convert Firestore Timestamp to Date
        });
        setDisableDate(dateList);
      }
    }
  }

  return (
    <>
      <div className='flex flex-col justify-between lg:flex-row gap-16 lg:items-center p-5'>
        <div className='flex flex-col gap-6 lg:w-2/4'>
          <Image src={(stay) ? stay.ref : "/"}
            width={500}
            height={500}
            alt="Image by publisher" className='w-full h-full aspect-square object-cover rounded-xl' />

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

          <h6 className='text-2xl font-semibold mt-2 ms-2'>Reserve Your Dates</h6>
          <div className='flex md:flex-row flex-col  gap-12'>

            <div className='flex flex-row items-center'>
              <div className={cn("grid gap-2")}>

                <Popover >
                  <PopoverTrigger ref={popoverRef} asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !range[0] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {range[0].startDate ? (
                        range[0].endDate ? (
                          <>
                            {format(range[0].startDate, "LLL dd, y")} -{" "}
                            {format(range[0].endDate, "LLL dd, y")}
                          </>
                        ) : (
                          format(range[0].startDate, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateRange

                      onChange={item => handleDateChange([item.selection])}
                      editableDateInputs={true}
                      moveRangeOnFirstSelection={false}
                      ranges={range}
                      months={2}
                      disabledDates={disableDate}
                      direction="horizontal"
                      className="calendarElement"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Button onClick={
                async () => {
                  if (range[0].status) {
                    
                    handlePayment()
                  } else {
                    toast({
                      title: "Please pick a date!",
                      variant: "destructive"
                    })
                  }
                }
              } className=' text-white font-semibold py-3 px-16 rounded-xl h-full'>Book Now</Button>
              <h1 className="text-primary ">Total Price: ₹{amount * (stay ? stay.price : 0)}</h1>

            </div>
          </div>
          <Toaster />
          <h6 className='flex items-center text-xl font-semibold mt-2 ms-2'>Overall Rating:
            <Rating
              className="mb-1"
              size={25}
              initialValue={stay?.rate}
              readonly={true}
              SVGclassName="inline-block"
            /></h6>
          <h6 className='flex items-center  font-semibold mt-2 ms-2'>Contact {cid} : {phone}</h6>
          <h1 className='flex items-center text-primary  font-semibold mt-2 ms-2'>{stay?.state}, {stay?.country}</h1>

        </div>




      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Reviews & Ratings*/}
        {id && <RatingsFragment hid={id} />}

        <div className="m-10 p-4">
          <h1 className="text-primary text-lg">What we offer!!</h1>
          {stay && stay.items ? (
            stay.items.map((i) => (
              <li key={i}>
                {i}
              </li>
            ))
          ) : null}
        </div>
      </div>

    </>
  )
}
