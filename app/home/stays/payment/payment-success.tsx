'use client'
import { db } from "@/app/authentication/firebase";
import { query, collection, and, where, onSnapshot } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Resend } from "resend";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const pid = searchParams?.get("id");


  const [data, setData] = useState<{
    total:number, name:string
  }[]>([]);
  const fetchPid = (pid:any) => {
    
    if(pid){
      const q = query(collection(db, "history"),
        where("pid", "==", "pay_MolarLYfcuKArA"),
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setData(
          querySnapshot.docs.map((doc) => ({total: doc.data().price, name: doc.data().hname }))
        );
      });

      
  
      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }
  useEffect(() => {
    fetchPid(pid)

  },[pid])
 
 
  useEffect(() => {
    const fetchData = async () => {
      if (data[0]) {
        console.log(data[0]);
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify({
          //   name:"data[0].name",

          // })
        });

        const responseJson = await res.json();
        console.log(responseJson);
      }
    };

    fetchData();
  }, [data]);

  return(
    <>
    
    </>
  )
}