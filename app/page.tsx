'use client';
import { register } from 'module';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Register from './authentication/register/page';


export default function Home() {
  
  return (
    <Register/>
  )
}

Home.requireAuth = true