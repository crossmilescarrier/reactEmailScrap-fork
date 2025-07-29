import React from 'react'
import { Link } from 'react-router-dom'

export default function ThreadItem({thread}) {
  return (
    <Link to={`/${'naveendev@crossmilescarrier.com'}/email/${thread.id}`}
      className="p-6 block rounded-[20px] bg-white border border-gray-200 hover:shadow-sm transition cursor-pointer"
   >
      <div className="flex justify-between items-center">
      <div className="text-[20px] font-bold text-black-800">{thread.sender}</div>
      <div className="text-xs text-gray-500">{thread.time}</div>
      </div>
      <div className="text-normal mt-1 text-gray-600 line-clamp-1">{thread.snippet}</div>
   </Link>
  )
}
