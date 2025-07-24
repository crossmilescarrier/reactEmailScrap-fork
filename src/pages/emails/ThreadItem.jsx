import React from 'react'

export default function ThreadItem({thread}) {
  return (
    <div
      key={thread.id}
      className="p-6 rounded-[20px] bg-white border border-gray-200 hover:shadow-sm transition cursor-pointer"
   >
      <div className="flex justify-between items-center">
      <div className="font-lg font-bold text-gray-800">{thread.sender}</div>
      <div className="text-xs text-gray-500">{thread.time}</div>
      </div>
      <div className="mt-1 text-gray-900 font-medium">{thread.subject}</div>
      <div className="text-sm text-gray-600 truncate">{thread.snippet}</div>
   </div>
  )
}
