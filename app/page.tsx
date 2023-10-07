'use client';
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
import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';


export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    // Cleanup the subscription when unmounting
    return () => unsubscribe();
  }, []);
  return (
    <>

      {user ? <HomePage /> : <Login />}

    </>

  )
}

Home.requireAuth = true