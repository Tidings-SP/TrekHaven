import TopNavBar from "@/components/navbar/top-navbar";
import Filters from "./filters/filters";
import Stays from "./stays/stays";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../authentication/firebase";

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if(!authUser){

        router.push("/authentication/signin")
      }
    });

    // Cleanup the subscription when unmounting
    return () => unsubscribe();
  });

  
  return (
    <>
    
      <TopNavBar/>
      <Filters/>
      <Stays/>
    </>
  )
}