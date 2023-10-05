"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { passSchema, registerSchema } from "../../validators/auth-validator"
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
import { useRouter } from 'next/navigation'
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"



type Input = z.infer<typeof passSchema>;

export default function ForgotPassword() {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<Input>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: Input) {

      await sendPasswordResetEmail(auth, data.email)
      .then(() => { 
        toast(
            {
                title: "Check your registered mail to reset your password!!...",
            }
        )
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
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Get reset password link on your mail!</CardDescription>
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

                <div className="flex flex-col space-y-4">
                  <div >
                    <Button
                      type="button"
                      className="float-right"
                      variant="link"
                      onClick={() => router.push('/authentication/signin')}
                    >
                      ← Back to Login Page
                    </Button>

                  </div>

                  <Button type="submit">Send Forgot Password Email</Button>
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