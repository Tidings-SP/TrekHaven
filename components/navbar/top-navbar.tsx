import React from "react";

import { CgProfile } from "react-icons/cg";
import {BsSearch} from "react-icons/bs";
import { ModeToggle } from "../ui/toggle-mode";
import { Input } from "../ui/input";
const TopNavBar = () => {
  return (
    <div className="border-b  py-6">
      <div className="container sm:flex justify-between items-center">
        <div className="font-bold text-4xl text-center pb-4 sm:pb-0">
          TrekHaven
        </div>

        <div className="w-full sm:w-[300px] md:w-[70%] relative">
          <Input
            type="text"
            placeholder="Enter any product name..."
          />

          <BsSearch
            className="absolute right-0 top-0 mr-3 mt-3"
            size={20}
          />
        </div>

        <div className="hidden lg:flex gap-4 text-[30px]">
          <CgProfile />

            
          </div>
          <div className="hidden lg:flex gap-4 text-[30px]">

            
          <ModeToggle/>
          </div>


          
          </div>
        </div>
  );
};

export default TopNavBar;