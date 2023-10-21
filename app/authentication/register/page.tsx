"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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


type Input = z.infer<typeof registerSchema>;

export default function Register() {
    const { toast } = useToast()
    const router = useRouter()
    const [formStep, setFormStep] = React.useState(0)
    const form = useForm<Input>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    })

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
                        console.log(error);
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
        <main>
            <div className='min-h-screen'>
                <Card className="w-[350px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>Find the best Accommodation here!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 relative p-1 overflow-x-hidden">
                                <motion.div
                                    animate={{ translateX: `-${formStep * 102}%` }}
                                    transition={{ ease: "easeInOut" }}
                                    className={cn("space-y-3", {
                                        // hidden: formStep == 1,
                                    })}>


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
                                                            if (!/[a-z]/i.test(event.key)) {
                                                                event.preventDefault(); // Prevent input of characters that do not match the regular expression.
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
                                    <div className="justify-item-stretch">

                                        <Button className="float-right" variant={"link"} type="button"
                                            onClick={() => router.push("/authentication/signin")}
                                        >Already Register! Login.</Button>
                                    </div>

                                </motion.div>

                                <motion.div
                                    animate={{ translateX: `${100 - formStep * 100}%` }}
                                    style={{ translateX: `${100 - formStep * 100}%` }}
                                    transition={{ ease: "easeInOut" }}
                                    className={cn("space-y-3 absolute top-0 left-0 right-0", {
                                        // hidden: formStep == 0,
                                    })}>

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
                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>DOB</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>

                                <div className="flex gap-2">


                                    <Button type="button"
                                        variant={'ghost'}
                                        className={cn({ hidden: formStep == 1, })}
                                        onClick={() => {
                                            form.trigger(['name', 'email', 'phone'])
                                            const emailState = form.getFieldState('email')
                                            const nameState = form.getFieldState('name')
                                            const phoneState = form.getFieldState('phone')

                                            if (!emailState.isDirty || emailState.invalid) return;
                                            if (!nameState.isDirty || nameState.invalid) return;
                                            if (!phoneState.isDirty || emailState.invalid) return;
                                            setFormStep(1);
                                        }}
                                    >Next Step
                                        <ArrowRight className="w-4 h-4 ml2" />
                                    </Button>

                                    <Button type="submit"
                                        className={cn({
                                            hidden: formStep == 0,
                                        })}
                                    >Submit
                                    </Button>

                                    <Button type="button"
                                        variant={'ghost'}
                                        className={cn({ hidden: formStep == 0, })}
                                        onClick={() => { setFormStep(0); }}
                                    >Go Back</Button>

                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <Toaster />
            </div>

        </main>



    )
}