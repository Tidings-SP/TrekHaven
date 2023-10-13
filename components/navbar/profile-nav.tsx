"use client"
import { CgProfile } from "react-icons/cg";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { auth } from "@/app/authentication/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export function ProfileNav() {

  const [uid, setUid] = useState<string | null>("");
  const [name, setName] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");

  const router = useRouter()
  
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, update user data
      setUid(user.uid);
      setName(user.displayName);
      setEmail(user.email);
    } else {
      // User is not authenticated, clear user data
      setUid(null);
      setName(null);
      setEmail(null);
    }
  });

  return () => unsubscribe(); // Cleanup when the component unmounts
}, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <CgProfile className="text-[30px] justify-center" />
            {/* <AvatarFallback>TH</AvatarFallback> */}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
          onClick={() => router.push('/home/user')}
          >
            Your Dashboard

          </DropdownMenuItem>
          <DropdownMenuItem
          onClick={()=>router.push('/admin/admin-dashboard')}
          >
            Manage Stays

          </DropdownMenuItem>

        </DropdownMenuGroup>
        {uid && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            onClick={()=>signOut(auth)}
            >
              Log out

            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}