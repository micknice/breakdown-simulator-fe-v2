import Image from 'next/image'
import { Inter } from 'next/font/google'
import Main from '../components/Main'
import Test from '../components/Test'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (

    <div className='w-full h-screen'>
      {/* <div className=''> */}
        <Main/>
      {/* </div> */}
     
    </div>
  )
}
