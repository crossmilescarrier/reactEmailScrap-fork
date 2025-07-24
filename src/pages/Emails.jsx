import React from 'react'
import data from '../pages/sent.json'
import data2 from '../pages/inbox.json'
export default function Emails() {
  console.log(data);
  console.log(data2);
      
  return (
    <div className='text-white'>
      {data && data.map((mail, index) => (
        <div key={index} className="email-item mb-12 border p-4 rounded-lg bg-gray-800"> 
          <h3>{mail.subject}</h3>
          <p>From: {mail.from}</p>
          <p>To: {mail.to}</p>
          <p>Date: {mail.date}</p>

          {mail?.innermail.map((m)=>{
            return <div className="border-t pt-12">
            <p>Date : {m.date}</p>
            <p>from : {m.from}</p>
            <p>To : {m.to}</p>
            {/* <p>{m?.body?.textBlocks && m?.body?.textBlocks.map((t, index) => <div className='mb-3 border-t' key={index}>{t}</div>)}</p> */}
            <p dangerouslySetInnerHTML={{__html: m.body?.rawHtml}} ></p>

            <h2>Attachments</h2>
            {m?.attachments && m?.attachments.map((attachment, index) => {
                return <>
                <div key={index} className="attachment-item mb-2">
                  <a href={attachment.downloadUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">{attachment.filename}</a>
                  <img src={`/${attachment?.localPath}`} />
                </div>
                </> 
            })}
            </div>
          })}
        </div>
      ))}
      {/* {data2 && data2.map((mail, index) => (
        <div key={index} className="email-item mb-12 border p-4 rounded-lg bg-gray-800"> 
          <h3>{mail.subject}</h3>
          <p>From: {mail.from}</p>
          <p>To: {mail.to}</p>
          <p>Date: {mail.date}</p>

          {mail?.innermail.map((m)=>{
            return <div className="border-t pt-12">
            <p>Date : {m.date}</p>
            <p>from : {m.from}</p>
            <p>To : {m.to}</p>
            <p dangerouslySetInnerHTML={{__html: m.body}} ></p>
            </div>
          })}
        </div>
      ))} */}
    </div>
  );
}
