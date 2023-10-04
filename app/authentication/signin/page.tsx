"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { registerSchema, signinSchema } from "../../validators/auth-validator"
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
import { useToast } from "@/components/ui/use-toast"
import { easeInOut } from "framer-motion/dom"
import { ModeToggle } from "@/components/ui/toggle-mode"
import { redirect, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react';
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"



type Input = z.infer<typeof signinSchema>;

export default function Login() {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<Input>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: Input) {
    const email = "suryaprakashspro@gmail.com"
    const password = "123456"
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => { 
        toast(
          {
              title: "Signed-in successfully!",
          });
        router.push('/home') })
      .catch((error) => { 
        toast(
          {
              title: "Something went wrong:(",
              variant: "destructive",
          });
          console.log(error); })
  }

  return (
    <main>
      <div className='min-h-screen'>
        <Card className="w-[350px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Find the best Accommodation here!</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

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
                {/* Password */}
                <FormField
                  control={form.control}

                  name="password"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your password..." type="password"  {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-4">
                  <div >
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => router.push('/authentication/register')}
                    >
                      New User?</Button>
                    <Button
                      type="button"
                      className="float-right"
                      variant="link"
                      onClick={() => router.push('/authentication/forgot-password')}
                    >
                      Forgot Password?</Button>
                  </div>

                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

    </main>



  )
}