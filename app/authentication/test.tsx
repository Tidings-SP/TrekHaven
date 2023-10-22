"use client"
import { useEffect, useState } from "react";

async function addr(pin:any) {
  const data = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  console.log(await data.json());
}

export default function TestAdr() {
  const [pin, setPin] = useState<string>()
  useEffect(()=>{
    addr(pin)

  },[pin])

  return(
    <>
    <input type="number" onChange={(e)=>setPin(e.target.value)} />
    </>
  )
}