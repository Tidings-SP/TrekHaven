import { Toaster } from "@/components/ui/toaster"
import { ModeToggle } from '@/components/ui/toggle-mode'
import Register from './authentication/register'



export default function Home() {
  return (
    
    <main>
      
      <ModeToggle className="absolute top-6 right-6"/>
      <div className='min-h-screen'>
        <Register className="w-[350px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
        <Toaster/>
      </div>
      
      
      
    </main>
  )
}
