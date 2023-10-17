import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer'

export async function POST() {
    try {
        // const { subject, message } = await request.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            
            auth: {
                user: 'suryaprakashspro@gmail.com',
                pass: 'wminxurjqxdbxtdf'
            }
        })

        const mailOption = {
            from: 'suryaprakashspro@gmail.com',
            to: 'suryaprakashspro@gmail.com',
            subject: 'Successful booking of stay with Trek Haven',
      html: `<h1><strong>Enjoy your trip with</strong></h1>
      <p> Thank you for making an accommodation booking worth ₹2000
      here is your payment Id: testid.
        `
        }

        await transporter.sendMail(mailOption)

        return NextResponse.json({ message: "Email Sent Successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Failed to Send Email" }, { status: 500 })
    }
}