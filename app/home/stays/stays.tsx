"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { onSnapshot, query, where, collection, and, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/app/authentication/firebase";
import { useRouter } from "next/navigation";
import { BsFillStarFill } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { ModeToggle } from "@/components/ui/toggle-mode";
import PropagateLoader from "react-spinners/PropagateLoader";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfileNav } from "@/components/navbar/profile-nav";
import { onAuthStateChanged } from "firebase/auth";

async function addImpression(uid: any, local: string, price: number) {
  if (uid) {
    const ref = doc(db, "user", uid);
    const aford = (await getDoc(ref)).data()?.affordable
    await updateDoc(ref, {
      location: arrayUnion(local),
      affordable: (aford + price / 2) / 2,
    })
  }

}

const variants = {
  open: { opacity: 1, y: 0, height: "auto" },
  closed: { opacity: 0, y: "-200%", height: 0 },
}
export default function Stays() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [topRate, setTopRate] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [open, setOpen] = useState(0);

  const [selectedState, setSelectedState] = useState(''); // State filter
  const [selectedDistrict, setSelectedDistrict] = useState(''); // District filter
  const [selectedArea, setSelectedArea] = useState(''); // Area filter

  const [listState, setListState] = useState<string[]>();
  const [listDistrict, setListDistrict] = useState<string[]>();
  const [listArea, setListArea] = useState<string[]>();

  let uid = auth.currentUser?.uid;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, update uid
      uid = user.uid;
    } else {
      console.log("Not logged in")
    }
  });

  const [stays, setStays] = useState<{
    id: string;
    name: string;
    desc: string;
    price: number;
    rate: number;
    ref: string;
    items: string[];
    location: string; // state
    city: string; // district
    area: string;
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
          items: doc.data().items,
          location: doc.data().state,
          city: doc.data().city,
          area: doc.data().area,
        }))
      );
    });

    return () => unsubscribe(); // Cleanup when the component unmounts
  }, []);

  // Extract unique states from stays
  useEffect(() => {
    const uniqueStates = new Set<string>();

    stays.forEach((stay) => {
      uniqueStates.add(stay.location);
    });

    setListState(Array.from(uniqueStates));
  }, [stays]);

  // Extract unique districts based on selected state
  useEffect(() => {
    const uniqueDistricts = new Set<string>();

    stays.forEach((stay) => {
      if (stay.location === selectedState) {
        uniqueDistricts.add(stay.city);
      }
    });

    setListDistrict(Array.from(uniqueDistricts));
  }, [stays, selectedState]);

  // Extract unique areas based on selected state
  useEffect(() => {
    const uniqueAreas = new Set<string>();

    stays.forEach((stay) => {
      if (stay.location === selectedState && stay.city === selectedDistrict) {
        uniqueAreas.add(stay.area);
      }
    });

    setListArea(Array.from(uniqueAreas));
  }, [stays, selectedState, selectedDistrict]);


  function shuffleArray(array: any) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  const filteredStays = shuffleArray(
    stays.filter((stay) => {
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

      // Check if the state, district, and area filters are met
      const stateMatch = selectedState === '' || stay.location.toLowerCase() === selectedState.toLowerCase();
      const districtMatch = selectedDistrict === '' || stay.city.toLowerCase() === selectedDistrict.toLowerCase();
      const areaMatch = selectedArea === '' || stay.area.toLowerCase() === selectedArea.toLowerCase();


      // Return true if all of the conditions are met
      return searchTermMatch &&
        priceMatch &&
        rateMatch &&
        amenitiesMatch &&
        stateMatch &&
        districtMatch &&
        areaMatch;
    })
  );



  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };


  function handleOnClick(id: string, location: string, price: number) {
    addImpression(uid, location, price)
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
            <div className="flex text-[30px] mt-2 sm:hidden">

              <ProfileNav />
            </div>

          </div>

          <div className="hidden">



          </div>
          <div className="w-full sm:w-[300px] md:w-[50%] relative">
            <Input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter any stay name..."
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

          <div
            className="hidden lg:flex gap-4 text-[30px]">

            <ProfileNav />

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
          <div className={cn("flex flex-col p-6 accent-primary", { hidden: open === 0 })}>
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

            <div className="md:flex space-x-2">
              {/* Top Rated */}
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

              {/* State */}
              <div>
                <h4 className="text-primary mt-2">State</h4>

                <Select
                  onValueChange={(e) => {
                    setSelectedState(e)
                    if (e === "__empty__") {
                      setSelectedState('')
                      setSelectedDistrict('')
                      setSelectedArea('')
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>State</SelectLabel>

                      <SelectItem value='__empty__'>Show All</SelectItem>

                      {
                        listState?.map((i) => (

                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))
                      }


                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div>
                <h4 className="text-primary mt-2">District</h4>

                <Select
                  onValueChange={(e) => {
                    setSelectedDistrict(e)
                    if (e === "__empty__") {
                      setSelectedDistrict('')
                      setSelectedArea('')
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>District</SelectLabel>
                      <SelectItem value='__empty__'>Show All</SelectItem>

                      {
                        listDistrict?.map((i) => (

                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))
                      }

                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Area */}
              <div>
                <h4 className="text-primary mt-2">Area</h4>

                <Select
                  onValueChange={(e) => {
                    setSelectedArea(e)
                    if (e === "__empty__") {
                      setSelectedArea('')
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Area</SelectLabel>
                      <SelectItem value='__empty__'>Show All</SelectItem>

                      {
                        listArea?.map((i) => (

                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))
                      }

                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

            </div>




          </div>
        </motion.div>
      </div>
      {/* Body */}
      {
        stays.length == 0 ? (
          <div className="flex justify-center ">
            <div className='text-center text-lg text-primary m-10'>Loading...</div>

            <div className="left-[48%] mt-4 fixed">
              <PropagateLoader color="#22C45D" />

            </div>
          </div>
        ) : (
          <main className="container mx-auto py-8 px-8">
            <h1 className="text-2xl font-bold pb-3">Find Best Stays!</h1>
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6">
              {filteredStays.map(card => (
                <div
                  className=" shadow-lg rounded-lg hover:bg-secondary cursor-pointer"
                  key={card.id}
                  onClick={() => handleOnClick(card.id, card.location, card.price)} >
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
                    <div className="flex float-right items-center">{Number(card.rate).toFixed(1)} <BsFillStarFill className="ms-3 mb-1" color="yellow" /></div>
                  </div>
                </div>

              ))}
            </div>
          </main>
        )
      }

    </>

  )
}