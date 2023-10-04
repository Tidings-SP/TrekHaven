import TopNavBar from "@/components/navbar/top-navbar";
import Filters from "./filters/filters";
import Stays from "./stays/stays";

export default function HomePage() {
  return (
    <>
      <TopNavBar/>
      <Filters/>
      <Stays/>
    </>
  )
}