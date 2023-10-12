import React from "react";

import { CgProfile } from "react-icons/cg";
import { BsSearch } from "react-icons/bs";
import { ModeToggle } from "../ui/toggle-mode";
import { Input } from "../ui/input";
import Link from "next/link";
import { Plus, PlusCircle } from "lucide-react";
const TopNavBar = () => {
  return (
    <div className="border-b  py-6">
      <div className="container sm:flex justify-between items-center ">
        <div className="flex flex-row justify-between">
          <div className=" font-bold text-4xl text-center pb-4 sm:pb-0">
            TrekHaven

          </div>

        </div>

        <div className="hidden">



        </div>
        <div className="w-full sm:w-[300px] md:w-[50%] relative">
          

          
        </div>
        <Link href="/home">
          <div className="hidden md:flex gap-4 font-medium navbar__link relative">
            Switch to Buyer Mode
          </div>
        </Link>


        <Link href="/admin/new-stay" className="hidden md:flex gap-4 text-[30px]">
          <PlusCircle size={30} />


        </Link>
        <div className="hidden md:flex gap-4 text-[30px]">
          <ModeToggle />
        </div>



      </div>
    </div>
  );
};

export default TopNavBar;