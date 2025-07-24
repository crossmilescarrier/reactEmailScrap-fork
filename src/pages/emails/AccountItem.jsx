import React from 'react'
import { Link } from 'react-router-dom'

export default function AccountItem() {
  return (
   <Link to='/account/naveen@crossmilescarrier.com' className='email-item flex items-center justify-between p-6 bg-gray-200 hover:bg-gray-300 rounded-[20px] mb-4'>
         <div>
            <h2 className='font-bold text-2xl'>naveen@crossmilescarrier.com</h2>
            <p className='mt-3'>
            Last synced: 2 hours ago
            </p>
         </div>
         <span className='bg-green-700 text-white py-1 px-3 text-sm rounded-full'>Active</span>
      </Link>
  )
}
