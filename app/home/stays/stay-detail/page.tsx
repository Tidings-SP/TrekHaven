"use client"
import { Resend } from 'resend';
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "@/app/authentication/firebase";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFieldArray, useForm } from 'react-hook-form';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';


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
async function add(uid: string | undefined,
  hid: string,
  hname: string,
  createrid: string,
  pid: string,
  price: number,
  status: string,
  proofref: string[],
  aadhaar: number[],
) {
  await setDoc(doc(db, "history", pid), {
    userid: uid,
    createrid: createrid,
    hname: hname,
    price: price,
    pid: pid,
    hotelid: hid,
    time: new Date().toLocaleString(),
    status: status,
    proofref: proofref,
    aadhaar: aadhaar
  });
}
export default function StayDetail() {
  const [amount, setAmount] = useState(0);
  const [stay, setStay] = useState<Stay | null>(null);
  const [disableDate, setDisableDate] = useState<Date[]>([]);

  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter()

  const [isValidIdProof, setIsValidIdProof] = useState(false)
  const [aadhaarNo, setAadhaarNo] = useState<number[]>([])
  const [img, setImg] = useState<File[]>([])
  const [imgRef, setImgRef] = useState<string[]>([])

  const [uid, setUid] = useState<string>()
  const [uname, setUname] = useState<string>()
  const [uemail, setUemail] = useState<string>()
  const [uphone, setUphone] = useState<string>()
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, update uid
        setUid(user.uid);
      }
    });

    return () => unsubscribe();
  }, [])
  // Get user data
  useEffect(() => {
    async function fetch() {
      if (uid) {
        const snap = await getDoc(doc(db, "user", uid));
        if (snap.exists()) {
          setUphone(snap.data().userphone);
          setUemail(snap.data().useremail);
          setUname(snap.data().username);



        }

      }
    }

    fetch();


  }, [uid])

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
        handler: async function (response: any) {
          // Validate payment at server 
          // Array to store the download URLs of uploaded images
          const imageUrls: string[] = [];

          // Upload each image and collect their URLs
          await Promise.all(
            img.map(async (im) => {
              // Get the original file extension
              const fileExtension = im.name.split('.').pop();

              // Generate a random image name
              const randomImageName = generateUUID() + '.' + fileExtension;

              const imgRef = ref(storage, `idproof/${randomImageName}`);
              const snapshot = await uploadBytes(imgRef, im);
              const url = await getDownloadURL(snapshot.ref);
              imageUrls.push(url);
            })
          );
          add(uid, stay.id, stay.name, stay.createrid, response.razorpay_payment_id, amount * stay.price, "success", imageUrls, aadhaarNo)
          reserveDates();
          sendMail(response.razorpay_payment_id);
          alert(response.razorpay_payment_id);
          router.push(`/home/stays/payment?id=${response.razorpay_payment_id}`)
        },
        prefill: {
          name: uname,
          email: uemail,
          contact: "91" + uphone,
        },



      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        add(uid, stay.id, stay.name, stay.createrid, response.error.metadata.payment_id, amount * stay.price, "fail", [], [])
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

  //Send Mail
  async function sendMail(id: any) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cemail,
        name: uname,
        hname: stay?.name,
        date: String(range[0].startDate + " to " + range[0].endDate),
        price: (amount * (stay ? (stay.price) : 0)),
        total: ((disableDate.length * (stay ? (stay.price) : 0)) + (amount * (stay ? (stay.price) : 0))),
        id: id,
      })
    });
  }

  //Get Creater Data
  const [cid, setCid] = useState('');
  const [cemail, setCemail] = useState('');
  const [phone, setPhone] = useState('');
  async function getCreaterData(stay: any) {
    if (stay) {
      const ref = doc(db, "user", stay.createrid);
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setCid(snap.data().username)
        setPhone(snap.data().userphone)
        setCemail(snap.data().useremail)
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

  }, [range])

  async function reserveDates() {
    if (id) {
      dateList.forEach((date) => {
        const ref = doc(db, 'hotels', id); // Replace with your actual collection and document
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

  // Get Id Proof
  interface IdProof {
    no: number;
  }
  const { control, handleSubmit, register, getValues, setValue } = useForm<{ idProofs: IdProof[] }>({
    defaultValues: {
      idProofs: [{ no: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'idProofs',
  });

  function validateAadhaar(aadhaar: string): boolean {
    // The regular expression for a valid Aadhaar number.
    const aadhaarPattern: RegExp = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;

    // Check if the input matches the regular expression.
    if (aadhaarPattern.test(aadhaar)) {
      // Calculate the checksum digit.
      // const uidaiDigits: number[] = aadhaar.split("").map(Number);
      // const lastDigit: number | undefined = uidaiDigits.pop();
      // if (lastDigit !== undefined) {
      //   const sum: number = uidaiDigits.reduce((acc: number, digit: number, index: number) => {
      //     if (index % 2 === 0) {
      //       digit *= 2;
      //       if (digit > 9) {
      //         digit -= 9;
      //       }
      //     }
      //     return acc + digit;
      //   }, 0);

      //   // Check if the calculated checksum matches the last digit.
      //   if ((sum + lastDigit) % 10 === 0) {
      //     return true;
      //   }
      // }
      return true;
    }

    return false;
  }


  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function onIdSubmit(data: any) {
    if (!validateAadhaar(String(data.idProofs[data.idProofs.length - 1].no))) {
      toast({
        title: 'Please check your Aadhaar Number and press the save!!',
        variant: "destructive"
      })
      return;
    } else if (!img[data.idProofs.length - 1]) {
      toast({
        title: 'Please upload your aadhaar and press the save!!',
        variant: "destructive"
      })
      return;
    }


    setIsValidIdProof(true)
    setAadhaarNo([])
    data.idProofs.forEach((i: any) => setAadhaarNo((prev) => [...prev, i.no]))
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
                    if (!isValidIdProof) {
                      toast({
                        title: "Please add you Id proof & press save to continue...",
                        variant: "destructive"
                      })
                      return;
                    }
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

          <div className=' w-[53%]'>
            <form onSubmit={handleSubmit(onIdSubmit)}>
              <Label>Upload your Aadhaar</Label>
              <div className="space-y-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="space-y-2">
                    <Label>Guest {index + 1}</Label>

                    <Input
                      disabled={index !== getValues(`idProofs`).length - 1}
                      type="file"
                      onChange={(e) => {

                        if (e.target.files) {
                          const selectedFile = e.target.files[0];
                          const updatedIdProofs = [...img]; // Create a copy of the array
                          updatedIdProofs[index] = selectedFile; // Update the image for the specified index
                          setImg(updatedIdProofs); // Set the updated array back to the state
                        }
                      }}
                    />

                    <div className="flex gap-2">
                      <Input
                        disabled={index !== getValues(`idProofs`).length - 1}

                        type="number"
                        placeholder="Enter your Aadhaar number..."
                        {...register(`idProofs.${index}.no`)}
                        onKeyDown={(event) => {
                          const inputElement = event.target as HTMLInputElement;
                          const key = event.key;

                          // Allow backspace (keyCode 8) and only digits if the limit is not reached
                          if (
                            (key === "Backspace" || /^\d$/.test(key)) &&
                            (inputElement.value.length < 12 || key === "Backspace")
                          ) {
                            return; // Allow the keypress
                          }

                          event.preventDefault(); // Prevent other keypresses
                        }}
                      />
                      <Button
                        disabled={index === 0}
                        onClick={() => {
                          remove(index)
                          setIsValidIdProof(false)

                        }}
                        type="button"
                        variant="destructive"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className='space-x-2 flex mt-2'>
                <Button
                  disabled={(getValues(`idProofs`).length) > 5}
                  type='button'

                  onClick={() => {
                    setIsValidIdProof(false)
                    const aadhaarValue = getValues(`idProofs.${getValues(`idProofs`).length - 1}.no`);
                    if (!validateAadhaar(String(aadhaarValue))) {
                      toast({
                        title: 'Please check your Aadhaar Number!!',
                        variant: "destructive"
                      })
                      return;

                    } else if (!img[getValues(`idProofs`).length - 1]) {
                      toast({
                        title: 'Please upload your Aadhaar!!',
                        variant: "destructive"
                      })
                      return;
                    }

                    append({ no: 0 })
                  }}
                  variant={"outline"}
                >
                  Add
                </Button>
                <Button className="text-primary"
                  variant="ghost">Save</Button>
              </div>


            </form>


          </div>

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
      <Toaster />
    </>
  )
}



