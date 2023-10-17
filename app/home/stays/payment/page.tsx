'use client'
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { query, collection, and, where, onSnapshot } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const pid = searchParams?.get("id");
  const router = useRouter()
  const [email, setEmail] = useState<string | null>("");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, update user data
        setEmail(user.email);
      } else {
        // User is not authenticated, clear user data
        setEmail(null);
      }
    });
  
    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  const [data, setData] = useState<{
    total:number, name:string, id:string
  }[]>([]);
  const fetchPid = (pid:any) => {
    
    if(pid){
      const q = query(collection(db, "history"),
        where("pid", "==", pid),
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setData(
          querySnapshot.docs.map((doc) => ({total: doc.data().price, name: doc.data().hname, id:doc.data().pid }))
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
        const res = await fetch('/api/mailer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name:data[0].name,
            price:data[0].total,
            id:data[0].id,
            email:email,
          })
        });

        router.push('/')

      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return(
    <>

    <div className="flex items-center justify-center">
      <p className="text-primary text-xl p-8 m-4">You have made a successful booking! Please wait while redirecting...</p>
    </div>
    
    </>
  )
}