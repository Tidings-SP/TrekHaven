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
            subject: 'You had a booking! with TrekHaven',
      html: `<h1>${res.name} Booked your stay ${res.hname}</h1>
      <p>you received Payment of ₹${res.price}
      <br>
      <br>
      Dates Reserved by ${res.name}: ${res.date}
      <br>
      <br>
    
      Total Revenue by this stay is: ₹${res.total}
      <br>
      <br>
      
      Here is the payment Id: <strong>${res.id}</strong>.
        `
        }

        await transporter.sendMail(mailOption)

        return NextResponse.json({ message: "Email Sent Successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Failed to Send Email" }, { status: 500 })
    }
}