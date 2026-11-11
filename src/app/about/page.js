"use client"
import React, {useState} from 'react'

function page() {
    const [count, setCount] = useState (0)
  return (
    <div className='flex flex-col items-center justify-center h-screnn gap-4' text-xl text-="true" blue="true">
        <p className= 'text-xl text-blue'>You Clicked {count}</p>
        <button onClick={() => setCount(count + 1)} className='bg-blue-900 text-white text-lg px-4 py-2 rounded cursor-pointer'>
            Click me
        </button>
    </div>
  )
}

export default page