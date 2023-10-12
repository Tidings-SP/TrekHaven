"use client"
import Image from "next/image";
import img from "@/assets/imgSample.webp"
import { useEffect, useState } from "react";
import { onSnapshot, query, where, collection, and } from "firebase/firestore";
import { db } from "@/app/authentication/firebase";
import { useRouter } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { BsSearch } from "react-icons/bs";
import { ModeToggle } from "@/components/ui/toggle-mode";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const variants = {
  open: { opacity: 1, y: 0, height: 350 },
  closed: { opacity: 0, y: "-200%", height: 0 },
}
export default function Stays() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [topRate, setTopRate] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [open, setOpen] = useState(0);
  const [stays, setStays] = useState<{
    id: string;
    name: string;
    desc: string;
    price: number;
    rate: number;
    ref: string;
    items: string[];
    location: string;
  }[]>([]);

  useEffect(() => {
    const q = query(collection(db, "hotels"),
      and(
        where("ispublished", "==", true),
      ));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setStays(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          desc: doc.data().desc,
          rate: doc.data().rate,
          price: doc.data().price,
          ref: doc.data().ref,
          location: doc.data().state,
          items: doc.data().items,
        }))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, [price, topRate]);

  const filteredStays = stays.filter((stay) => {
    const amenitiesFilter = selectedItems.length === 0 || selectedItems.every(item => stay.items.includes(item));
    const searchTermLowerCase = searchTerm.toLowerCase();
    const nameLowerCase = stay.name.toLowerCase();
    const descLowerCase = stay.desc.toLowerCase();
    const locationLowerCase = stay.location.toLowerCase();

    // Check if either the name or description contains the search term
    const searchTermMatch =
      nameLowerCase.includes(searchTermLowerCase) ||
      descLowerCase.includes(searchTermLowerCase) ||
      locationLowerCase.includes(searchTermLowerCase);

    // Check if the price condition is met
    const priceMatch = price === 0 || stay.price >= price;

    // Check if the rate (rating) condition is met
    const rateMatch = topRate === 0 || stay.rate >= topRate;

    // Check if the selected amenities are all included in the stay's amenities
    const amenitiesMatch = amenitiesFilter;

    // Return true if all of the conditions are met
    return searchTermMatch && priceMatch && rateMatch && amenitiesMatch;
  });

  useEffect(() => {
    console.log(selectedItems);
  }, [selectedItems]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };


  function handleOnClick(id: string) {

    router.push(`/home/stays/stay-detail?id=${id}`)
  }

  return (
    <>
      {/* Nav */}
      <div className="border-b  py-6">
        <div className="container sm:flex justify-between items-center ">
          <div className="flex flex-row justify-between">
            <div className=" font-bold text-4xl text-center pb-4 sm:pb-0">
              TrekHaven

            </div>
            <CgProfile className="flex text-[30px] mt-2 sm:hidden" />

          </div>

          <div className="hidden">



          </div>
          <div className="w-full sm:w-[300px] md:w-[50%] relative">
            <Input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter any product name..."
            />

            <BsSearch
              className="absolute right-0 top-0 mr-3 mt-3"
              size={20}
            />
          </div>
          <Link href="/admin/admin-dashboard">
            <div className="hidden lg:flex gap-4 font-medium navbar__link relative">
              Manage Your
              Stay


            </div>
          </Link>


          <div className="hidden lg:flex gap-4 text-[30px]">
            <CgProfile />


          </div>
          <div className="hidden lg:flex gap-4 text-[30px]">


            <ModeToggle />
          </div>



        </div>
      </div>
      {/* Filter */}
      <div className="border-b lg:block ">
        <div className="container">
          <div
            onClick={() => setOpen(1)}
            className="flex w-fit gap-10 mx-auto font-medium py-4">

            <div className="navbar__link relative cursor-pointer">
              Amenities
            </div>
            <div className="navbar__link relative cursor-pointer">
              Price
            </div>
            <div className="navbar__link relative cursor-pointer">
              Top Rated
            </div>

          </div>
          <div
            className="text-right"
          >

            <Button
              className={`${cn({ hidden: open == 0 })}`}
              onClick={() => {
                setOpen(0);

              }}
              type="button"><ChevronLeft className="h-4 w-4" /></Button>
          </div>
          {/* UI Filter */}
        </div>
        <motion.div
          animate={open ? "open" : "closed"}
          variants={variants}
        >
          <div className={cn("flex flex-col p-6 accent-primary", {hidden: open === 0})}>
            <h4 className="text-primary">Amenities</h4>
            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="Air Conditioning"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("Air Conditioning")}
              />
              Air Conditioning
            </label>

            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="Wifi"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("Wifi")}
              />
              Wifi
            </label>

            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="Kitchen"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("Kitchen")}
              />
              Kitchen
            </label>

            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="TV"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("TV")}
              />
              TV
            </label>

            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="Heating"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("Heating")}
              />
              Heating
            </label>

            <label>
              <input
                className="mr-2"
                type="checkbox"
                id="Pool"
                onChange={handleCheckboxChange}
                checked={selectedItems.includes("Pool")}
              />
              Pool
            </label>

            <h4 className="text-primary mt-2">Price</h4>
            <Input
              type="text"
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Around ₹ 1000..."
            />
            <div>
              <h4 className="text-primary mt-2">Top Rated</h4>

              <Select
                onValueChange={(e) => { setTopRate(Number(e)) }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Top Rated" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Ratings</SelectLabel>
                    <SelectItem value="0">Show All</SelectItem>
                    <SelectItem value="3">3+ Star</SelectItem>
                    <SelectItem value="4">4+ Star</SelectItem>

                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>





          </div>
        </motion.div>
      </div>
      {/* Body */}
      <main className="container mx-auto py-8 px-8">
        <h1 className="text-2xl font-bold pb-3">Find Best Stays!</h1>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
          {filteredStays.map(card => (
            <div
              className=" shadow-lg rounded-lg hover:bg-secondary cursor-pointer"
              key={card.id}
              onClick={() => handleOnClick(card.id)} >
              <div className="flex items-center justify-center   ">
                <div className="flex w-[100%] h-[100%] overflow-hidden items-center justify-center">

                  <Image
                    className="rounded-lg"
                    src={card.ref}
                    width={240}
                    height={240}
                    alt="Picture posted by the author"></Image>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-3 line-clamp-1">{card.name}</h3>
                <p className="text-lg font-normal line-clamp-2">{card.desc}</p>
              </div>

              <div className="flex flex-row text-xl justify-between p-5 m-4">
                <div className="flex float-left">₹ {card.price}</div>
                <div className="flex float-right items-center">{card.rate} <BsFillStarFill className="ms-3 mb-1" color="yellow" /></div>
              </div>
            </div>

          ))}
        </div>
      </main>
    </>

  )
}