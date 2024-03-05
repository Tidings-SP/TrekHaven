"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { NEVER, never, z } from "zod"
import { registerSchema } from "../../validators/auth-validator"
import { zodResolver } from "@hookform/resolvers/zod"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { easeInOut } from "framer-motion/dom"
import { ModeToggle } from "@/components/ui/toggle-mode"
import { redirect, useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "../firebase"
import { signIn } from "next-auth/react"
import TopNavBar from "@/components/navbar/top-navbar"
import { doc, setDoc } from "firebase/firestore"
import Link from "next/link"
import { useEffect, useState } from "react"

async function addr(pin: any) {
    const data = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    return await data.json()
}

type Input = z.infer<typeof registerSchema>;

export default function Register() {
    const { toast } = useToast()
    const router = useRouter()
    const [isValidPin, setIsValidPin] = useState(false)
    const [pin, setPin] = useState<string>()
    const [area, setArea] = useState<string[]>()
    const [loc, setLoc] = useState<{ state: string, district: string }>()


    const form = useForm<Input>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            pincode: "",
        },
    })
    useEffect(() => {
        const pincodeState = form.getFieldState('pincode')
        addr(pin).then((res) => {
            if (res[0].Status === "Success") {
                console.log(res[0].PostOffice)
                setArea((res[0].PostOffice).map((item: any) => item.Name))
                setLoc({
                    state: res[0].PostOffice[0].State,
                    district: res[0].PostOffice[0].District
                })
                setIsValidPin(true)
                form.clearErrors("pincode");
            } else {
                setLoc({
                    state: "",
                    district: ""
                })
                setArea([])
                setIsValidPin(false)
                if (pincodeState.isDirty) {
                    form.setError("pincode", {
                        type: "manual",
                        message: "Invalid Pincode",
                    });
                }

            }
        })

    }, [form, pin])
    const password = form.watch("password", "");
    const confirmPassword = form.watch("confirmPassword", "");

    useEffect(() => {
        if (password !== confirmPassword && form.getFieldState("confirmPassword").isDirty) {
            // Set error if passwords don't match
            form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
            });
        } else {
            // Clear error if passwords match
            form.clearErrors("confirmPassword");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password, confirmPassword]);
    const [yourAge, setYourAge] = useState<number | null>(null); // Initialize age state
 const watchDob = form.watch("dob"); // Get the value of "dob"
    useEffect(() => {
       
        if (watchDob) {
            const dob = new Date(watchDob);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            setYourAge(age); // Update age state
        }
    }, [watchDob]);


    function onSubmit(data: Input) {
        if (data.confirmPassword !== data.password) {
            toast(
                {
                    title: "Password do not match!",
                    variant: "destructive",
                }
            )

            return;
        }
        if (!isValidPin) {
            toast({
                title: "Enter a valid Pin Code",
                variant: "destructive"
            })
            return;
        }
        createUserWithEmailAndPassword(auth, data.email, data.password)
            .then(async () => {
                if (auth.currentUser) {
                    updateProfile(auth.currentUser, {
                        displayName: data.name,
                    })


                    await setDoc(doc(db, "user", auth.currentUser.uid), {
                        username: data.name,
                        useremail: data.email,
                        userphone: data.phone,
                        affordable: 2000,
                        location: [""],
                        area: data.area,
                        city: loc?.district,
                        state: loc?.state,
                        doorno: data.doorno,
                        street: data.street,
                        dob: data.dob,
                        pin: data.pincode,
                    });

                }

                signInWithEmailAndPassword(auth, data.email, data.password)
                    .then(() => {


                        toast(
                            {
                                title: "Account created successfully!",
                            }
                        )
                        router.push('/home')
                    })
                    .catch((error) => {
                        toast(
                            {
                                title: "Something went wrong:(",
                                variant: "destructive",
                            });
                    })
            })
            .catch((error) => {
                toast(
                    {
                        title: "Something went wrong:(",
                        variant: "destructive",
                    });
            });

    }
   

    return (
        <main className="flex items-center justify-center">

            <div className="bg-[url('/img/Login.jpg')] min-w-full"  >
                <div className="backdrop-brightness-50 p-10">



                
                <Card className="w-[300px] sm:w-[450px] ">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>Find the best Accommodation here!

                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-2 gap-4">
                                <div className="space-y-2">


                                    {/* Name */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        onKeyDown={(event) => {
                                                            const inputElement = event.target as HTMLInputElement;
                                                            const key = event.key;
                                    
                                                            if (inputElement.selectionStart) {
                                                              const prevChar = inputElement.value[inputElement.selectionStart - 1];
                                                              const nextChar = inputElement.value[inputElement.selectionStart];
                                                              if (key === " " && (prevChar === " " || nextChar === " ")) {
                                                                event.preventDefault();
                                                              }
                                                            }
                                                            // Allow arrow keys and backspace
                                                            if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" || key === "Backspace") {
                                                              return;
                                                            }
                                                            // Only allow alphabetical characters and single spaces
                                                            if (!/^[a-zA-Z\s]$/.test(key)) {
                                                              event.preventDefault();
                                                            }
                                                          }}
                                                        placeholder="Enter your name..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your email..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Phone Number */}
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        onKeyDown={(event) => {
                                                            const inputElement = event.target as HTMLInputElement;
                                                            const key = event.key;

                                                            // Allow backspace (keyCode 8) and only digits if the limit is not reached
                                                            if (
                                                                (key === "Backspace" || /^\d$/.test(key)) &&
                                                                (inputElement.value.length < 10 || key === "Backspace")
                                                            ) {
                                                                return; // Allow the keypress
                                                            }

                                                            event.preventDefault(); // Prevent other keypresses
                                                        }}
                                                        placeholder="Enter your phone number..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                </div>

                                <div className="space-y-2">

                                    {/* Password */}
                                    <FormField
                                        control={form.control}

                                        name="password"
                                        render={({ field }) => (
                                            <FormItem >
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your password..." type="password" tabIndex={-1} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Confirm Password */}
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Please verify your password..." type="password" tabIndex={-1} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* DOB */}
                                    <div className="flex space-y-8 gap-2">
                                        <FormField
                                        
                                            control={form.control}
                                            name="dob"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>DOB</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            tabIndex={-1}
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                            <h1 className="text-primary mt-8 ms-4 text-sm">
                                            Your age {yourAge !== null ? "is: "+yourAge : "must be greater than or equal to 18 years ago"}</h1>

                                        
                                    </div>


                                </div>

                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        {/* Pin Code */}
                                        <FormField
                                            control={form.control}
                                            name="pincode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pin Code</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            tabIndex={-1}
                                                            type="number"
                                                            {...field} // Pass the form control field directly here
                                                            onChange={(e) => {
                                                                const inputValue = e.target.value;
                                                                field.onChange(inputValue);
                                                                form.setValue('area', NEVER);
                                                                setPin(inputValue); // Update the 'pin' state
                                                            }}
                                                            onKeyDown={(event) => {
                                                                const inputElement = event.target as HTMLInputElement;
                                                                const key = event.key;

                                                                // Allow backspace (keyCode 8) and only digits if the limit is not reached
                                                                if (
                                                                    (key === "Backspace" || /^\d$/.test(key)) &&
                                                                    (inputElement.value.length < 6 || key === "Backspace")
                                                                ) {
                                                                    return; // Allow the keypress
                                                                }

                                                                event.preventDefault(); // Prevent other key presses
                                                            }}
                                                            placeholder="Pin Code..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Door No */}
                                        <FormField
                                            control={form.control}
                                            name="doorno"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Door Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Door no..." tabIndex={-1} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>
                                    <div className="flex space-y-6 gap-2">
                                        {/* Street */}
                                        <FormField
                                            control={form.control}
                                            name="street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="street addr..." tabIndex={-1} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <h1 className="text-primary mt-8 ms-4 text-sm">Your district {loc?.district} and state {loc?.state}</h1>

                                    </div>

                                    {/* Area */}
                                    <FormField
                                        control={form.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger tabIndex={-1}>
                                                            <SelectValue placeholder="Select your area" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {area?.map((a) => (
                                                            <SelectItem key={a} value={a}> {a} </SelectItem>

                                                        ))}


                                                    </SelectContent>
                                                </Select>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button variant={"link"} type="button"
                                        onClick={() => router.push("/authentication/signin")}
                                    >← Login</Button>
                                    <Button type="submit" className="mt-4 float-right px-10">Submit</Button>
                                </div>


                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <Toaster />
            

            <div className="absolute top-0 right-0 m-4">
                <Button className="float-right" variant={"link"} type="button"
                    onClick={() => router.push("/authentication/signin")}
                >← Login</Button>
            </div>
            </div>
            </div>
        </main>



    )
}