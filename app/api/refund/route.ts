import { useSearchParams } from 'next/navigation';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer'


export async function POST(request: Request) {
    const res =await request.json();
    try {
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            
            auth: {
                user: 'trekwithhaven@gmail.com',
                pass: 'eormewadoybnjubi'
            }
        })

        const mailOption = {
            from: 'trekwithhaven@gmail.com',
            to: res.email,
            subject: 'Successful Refund',
      html: `<h1>Refund: ${res.name}</h1>
      <p> Your refund has credited worth ₹${res.price}
      here is your refund Id: <strong>${res.id}</strong>.
        `
        }

        await transporter.sendMail(mailOption)

        return NextResponse.json({ message: "Email Sent Successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Failed to Send Email" }, { status: 500 })
    }
}