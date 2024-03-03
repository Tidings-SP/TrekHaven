"use client"
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { query, collection, and, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";


export default function DashboardUserData() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter()

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

  const [history, setHistory] = useState<{
    id: string;
    hname: string;
    price: number;
    status: string;
    no: string[];
    proof: string[];
    phone: number[];
    name: string[];
    dob: string[];

  }[]>([]);

  useEffect(() => {

    if (id) {

      const q = query(collection(db, "history"),
        and(
          where("hotelid", "==", id),
          where("createrid", "==", uid),
        ));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setHistory(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            hname: doc.data().hname,
            price: doc.data().price,
            status: doc.data().status,
            no: doc.data().aadhaar,
            proof: doc.data().proofref,
            phone: doc.data().phone,
            name: doc.data().name,
            dob: doc.data().dob,

          }))
        );
      });

      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }, [id, uid]);
  function calculateAge(dob: any) {
    const dobDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return (
    <>
      <div className='p-4 min-h-screen'>
        <h1 className="ps-5 pt-3 text-xl text-primary "> Booking History</h1>
        <div className='p-4'>
          {history.length === 0 ? (
            <div className="flex justify-center ">
              <div className='text-center text-lg text-primary m-10'>Loading...</div>

              <div className="left-[48%] mt-4 fixed">
                <PropagateLoader color="#22C45D" />

              </div>
            </div>
          ) : (
            <div className='w-full m-auto p-4 border rounded-lg  overflow-y-auto'>
              {history.map((order) => (
                <div
                  key={order.id}

                  className='grid grid-cols-2  rounded-lg my-3 p-4 border  items-center justify-between'
                >
                  <div>
                    <div className='font-bold'>Price: {order.price}</div>
                    <div className='text-sm mb-4'>
                      <span className='font-bold'>Booking Status:</span>{' '}
                      {order.status}
                    </div>
                    {
                      order.no.length === 0 ?
                        // Personal details
                        <div>
                          <div className="text-primary">
                            Name & DOB {order.name.map((i, index) => (
                            <div key={index}>
                              {i+" ("+order.dob[index]+") Age: "+ calculateAge(order.dob[index])} 
                            </div>
                          ))}
                          </div>
                          {order.proof.map((i, index) => (
                            <div key={index}>
                            </div>
                          ))}
                        </div>
                        :
                        // Proof
                        <div>
                          <div className="text-primary">
                            Proof Image
                          </div>
                          {order.proof.map((i, index) => (
                            <div key={index}>
                              <Link className="underline decoration-primary animate-pulse hover:animate-none hover:text-xl hover:text-primary" href={i} target="_blank">Aadhaar Proof Guest {index + 1}</Link>
                            </div>
                          ))}
                        </div>
                    }


                  </div>
                  <div className=' flex flex-col items-end gap-2'>
                    <div >
                      Order Id
                    </div>
                    <div className="mb-4">

                      {order.id}
                    </div>
                    {order.no.length === 0 ?
                      /* PersonalDetails MN */
                      <div>
                        <div className="text-primary">
                          Mobile Number
                        </div>
                        <div>
                          {order.phone.map((i) => (
                            <div key={i}>
                              {i}
                            </div>
                          ))}
                        </div>
                      </div>
                      :
                      /* Aadhaar */
                      <div>
                        <div className="text-primary">
                          Aadhaar Number
                        </div>
                        <div>
                          {order.no.map((i) => (
                            <div key={i}>
                              {i}
                            </div>
                          ))}
                        </div>
                      </div>
                    }




                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </>
  )
}