"use client"
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { and, arrayUnion, collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { BsFillStarFill, BsSearch } from "react-icons/bs";
import { ModeToggle } from "@/components/ui/toggle-mode";
import Link from "next/link";
import { ProfileNav } from "@/components/navbar/profile-nav";

async function addImpression(uid:any, local:string, price:number) {
  if(uid) {
    const ref = doc(db, "user", uid);
    const aford = (await getDoc(ref)).data()?.affordable
    await updateDoc(ref, {
      location: arrayUnion(local),
      affordable: (aford + price/2)/2,

    })
  }

}

export default function UserDash() {
  const router = useRouter();
  const [prec, setPrec] = useState(1000);
  const [loc, setLoc] = useState<string[]>([]);
  const [history, setHistory] = useState<{
    id: string;
    hname: string;
    price: number;
    status: string;
    pid: string;
    hid: string;

  }[]>([]);

  let uid = auth.currentUser?.uid;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, update uid
      uid = user.uid;
    } else {
      console.log("Not logged in")
    }
  });

  // Get History
  useEffect(() => {

    if (uid) {

      const q = query(collection(db, "history"),
        and(
          where("userid", "==", uid),
        ));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setHistory(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            hname: doc.data().hname,
            price: doc.data().price,
            status: doc.data().status,
            pid: doc.data().pid,
            hid: doc.data().hotelid,

          }))
        );
      });

      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }, [uid]);

  // Get Recommendation Data
  useEffect(() => {
    async function fetch() {
      if (uid) {
        const snap = await getDoc(doc(db, "user", uid));
        if(snap.exists()){
          setPrec(snap.data().affordable);
          setLoc(snap.data().location)
        }

      }
    }

    fetch();


  }, [uid])

  // Get Stays
  const [stays, setStays] = useState<{
    id: string;
    name: string;
    desc: string;
    price: number;
    rate: number;
    ref: string;
    items: string[];
    location: string;
  }[]>([]);

  useEffect(() => {
    const q = query(collection(db, "hotels"),
      and(
        where("ispublished", "==", true),
      ));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setStays(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          desc: doc.data().desc,
          rate: doc.data().rate,
          price: doc.data().price,
          ref: doc.data().ref,
          location: doc.data().state,
          items: doc.data().items,
        }))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  // First, shuffle the stays list
  const shuffledStays = [...stays]; // Create a copy of stays to shuffle
  for (let i = shuffledStays.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledStays[i], shuffledStays[j]] = [shuffledStays[j], shuffledStays[i]]; // Swap elements to shuffle
  }
  const filteredStays = shuffledStays.filter((stay) => {

    const priceFilter = stay.price >= (prec - (prec*0.6)) && stay.price <= (prec + (prec*0.6));
// Filter by price around (within 2000 range)
    const locationFilter = loc.includes(stay.location); // Filter by location

    return priceFilter && locationFilter;
  }).slice(0, 8);
  function handleOnClick(id: string, location:string, price:number) {
    addImpression(uid, location, price)
    router.push(`/home/stays/stay-detail?id=${id}`)
  }

  return (
    <>

      {/* TopNavBar */}
      <div className="border-b  py-6">
        <div className="container sm:flex justify-between items-center ">
          <div className="flex flex-row justify-between">
            <div className=" font-bold text-4xl text-center pb-4 sm:pb-0">
              TrekHaven

            </div>
            <div className="flex text-[30px] mt-2 sm:hidden">

              <ProfileNav />
            </div>

          </div>

          <div className="hidden">



          </div>
          <div className="w-full sm:w-[300px] md:w-[50%] relative">


          </div>
          <Link href="/admin/admin-dashboard">
            <div className="hidden lg:flex gap-4 font-medium navbar__link relative">
              Manage Your
              Stay


            </div>
          </Link>

          <div
            className="hidden lg:flex gap-4 text-[30px]">

            <ProfileNav />

          </div>
          <div className="hidden lg:flex gap-4 text-[30px]">


            <ModeToggle />
          </div>




        </div>
      </div>

      {/* You May also Like */}
      <div className="p-8">

        {filteredStays.length != 0 &&
          <>
          <h1 className="ps-5 py-3 text-xl text-primary ">You may also like</h1>
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
            {filteredStays.map(card => (
              <div
                className=" shadow-lg rounded-lg hover:bg-secondary cursor-pointer"
                key={card.id}
                onClick={() => handleOnClick(card.id, card.location, card.price)} >
                <div className="flex items-center justify-center   ">
                  <div className="flex w-[100%] h-[100%] overflow-hidden items-center justify-center">

                    <Image
                      className="rounded-lg"
                      src={card.ref}
                      width={240}
                      height={240}
                      alt="Picture posted by the author"></Image>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-3 line-clamp-1">{card.name}</h3>
                  <p className="text-lg font-normal line-clamp-2">{card.desc}</p>
                </div>

                <div className="flex flex-row text-xl justify-between p-5 m-4">
                  <div className="flex float-left">₹ {card.price}</div>
                  <div className="flex float-right items-center">{Number(card.rate).toFixed(1)} <BsFillStarFill className="ms-3 mb-1" color="yellow" /></div>
                </div>
              </div>

            ))}
          </div>
        </>
        }
        


        {/* History */}
        <div className='p-4 min-h-screen'>
          <h1 className="ps-5 pt-3 text-xl text-primary ">Booking History</h1>
          <div className='p-4'>
            {history.length === 0 ? (
              <div className='text-center text-primary'>Loading...</div>
            ) : (
              <div className='w-full m-auto p-4 border rounded-lg  overflow-y-auto'>
                {history.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      router.push(`/home/stays/stay-detail?id=${order.hid}`)
                    }}
                    className='grid grid-cols-1 md:grid-cols-2 hover:bg-secondary rounded-lg my-3 p-4 border  items-center justify-between cursor-pointer'
                  >
                    <div>
                      <div className='font-bold'>{order.hname}</div>
                      <div className='text-sm'>
                        <span className='font-bold'>Booking Status:</span>{' '}
                        {order.status}
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <div >
                        Payment Id
                      </div>
                      <div>
                        {order.pid}
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}
          </div>

        </div>
      </div>
    </>

  )
}