import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend('re_HtsLP3Ph_JAWYKdayzHeF5S1gRisX1TMe');


export async function POST(request) {

  try {
    const body = await request.json();
    console.log(body)
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'suryaprakashspro@gmail.com',
      subject: 'Successful booking of stay with Trek Haven',
      html: `<h1><strong>Enjoy your trip with</strong></h1>
      <p> Thank you for making an accommodation booking worth ₹2000
      here is your payment Id: testid.
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
