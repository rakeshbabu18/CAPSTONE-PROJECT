import React from 'react'
import { Link } from 'react-router'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Blog App</h1>
      <p className="text-xl text-gray-600 mb-8">Share your thoughts with the world</p>

      <div className="mt12 mt-[5%]">
         {/* Additional home page content can go here */}
         <p className='text-gray500'>Read articles, become an author, and share your knowledge!</p>         
      </div>

    </div>
  )
}

export default Home
