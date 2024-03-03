"use client"
import { db } from "@/app/authentication/firebase";
import { QuerySnapshot, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect } from "react";



export default function Fill() {
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "test"), (querySnapshot) => {
      querySnapshot.docs.forEach((doc: any) => {
        try {
          updateDoc(doc.ref, {
            test: [],
           
            
          });
          console.log(`Document ${doc.id} updated successfully.`);
        } catch (error) {
          console.error(`Error updating document ${doc.id}:`, error);
        }
      });
    });
    return () => unsubscribe();
  },[])


  return (
    <div>
      Updating
    </div>
  )
}