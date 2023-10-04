'use client';
import { register } from 'module';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Register from './authentication/register/page';
import HomePage from './home/page';
import Login from './authentication/signin/page';


export default function Home() {
  
  return (
    <Login/>
  )
}

Home.requireAuth = true