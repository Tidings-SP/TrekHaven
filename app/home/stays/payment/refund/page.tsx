'use client'
import { auth, db } from "@/app/authentication/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { query, collection, and, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BarLoader from "react-spinners/BarLoader";
export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const pid = searchParams?.get("id");
  const router = useRouter()

  const [email, setEmail] = useState<string | null>("");
  const [uid, setUid] = useState<string | null>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, update user data
        setEmail(user.email);
        setUid(user.uid);
      } else {
        // User is not authenticated, clear user data
        setEmail(null);
      }
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  const [data, setData] = useState<{
    total: number, name: string, id: string
  }[]>([]);
  const fetchPid = (pid: any, uid: any) => {

    if (pid) {
      const q = query(collection(db, "history"),
        and(
          where("pid", "==", pid),
          where("userid", "==", uid)
        )
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setData(
          querySnapshot.docs.map((doc) => ({ total: doc.data().price, name: doc.data().hname, id: doc.data().pid }))
        );
      });



      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }
  useEffect(() => {
    fetchPid(pid, uid)

  }, [pid, uid])


  useEffect(() => {
    const updateStatus = async () => {
      if (data[0]) {
        const washingtonRef = doc(db, "history", data[0].id);

        await updateDoc(washingtonRef, {
          status: "refund"
        });
      }
    }
    const fetchData = async () => {
      if (data[0]) {
        const res = await fetch('/api/mailer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data[0].name,
            price: data[0].total,
            id: data[0].id,
            email: email,
          })
        });

        router.push('/home/user')

      }
    };

    updateStatus();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>

      <div className="flex items-center justify-center">
        <p className="text-primary text-xl p-8 m-4">Refund in progress! Please wait while redirecting...</p>
      </div>
      <div className="bottom-0 fixed w-full">

        <BarLoader color="#22C45D" width='100%' height={5} />
      </div>

    </>
  )
}