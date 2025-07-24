import React from 'react'
import data from '../pages/chatdata.json'

export default function Chats() {
  return (
    <div className='text-white'>
      {data.map((chat) => (
        <div key={chat.spaceId} className='mb-12 border p-4 rounded-lg bg-gray-800'>
          <h2>{chat.displayName}</h2>
          {chat.messages.map((message) => (
            <div key={message.id}>
              <p>{message.text}</p>
              <small>{message.createTime}</small>
              <div>
               {message.attachments && message.attachments.length > 0 && (
                 <div>
                   <h3>Attachments:</h3>
                   <ul>
                     {message.attachments.map((attachment) => (
                       <li key={attachment.id}>
                         <a href={attachment.thumbnailUri} target="_blank" rel="noopener noreferrer">
                           {attachment.name}
                           <img src={attachment.thumbnailUri} alt={attachment.name} style={{ width: '100px', height: '100px' }} />
                         </a>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
