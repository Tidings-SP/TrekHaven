'use client';
import { register } from 'module';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Register from './authentication/register/page';
import HomePage from './home/page';
import Login from './authentication/signin/page';
import Stays from './home/stays/stays';
import NewStay from './admin/new-stay/page';
import SettingsLayout from './admin/new-stay/layout';
import Ratings from './home/stays/stay-detail/ratings/page';
import StayDetail from './home/stays/stay-detail/page';
import { auth } from './authentication/firebase';


export default function Home() {
  return (
    <Login/>
  )
}

Home.requireAuth = true