import TopNavBar from "@/components/navbar/top-navbar";
import Filters from "./filters/filters";
import Stays from "./stays/stays";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {


  
  return (
    <>
    
      <TopNavBar/>
      <Filters/>
      <Stays/>
    </>
  )
}