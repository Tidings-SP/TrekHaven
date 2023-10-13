"use client"
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { and, collection, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function UserDash() {
  const router = useRouter();
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

  

  useEffect(() => {
    console.log(uid)

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
            hid:doc.data().hotelid,

          }))
        );
      });

      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }, [uid]);

  return (
    <div className='p-4 min-h-screen'>
      <h1 className="ps-5 pt-3 text-primary ">Booking History</h1>
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
                className='hover:bg-secondary rounded-lg my-3 p-4 border flex items-center justify-between cursor-pointer'
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
  )
}