import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import inbox from '../inbox.json';
import { use } from 'react';
 
export default function EmailContainer() {
   const { email } = useParams();
   const data = inbox &&  inbox[0];
   const defaultCollapse = () => {
      if (data && data.innermail && data.innermail.length < 2) {
         return true;
      }
      return false;
   }

   
   const ITEM = ({ e }) => { 
      const [showMail, setShowMail] = useState(defaultCollapse);
      const email = useRef(null);
      useEffect(() => {
         const quoteContainers = document.querySelectorAll('.gmail_quote_container');
         quoteContainers.forEach(container => {
            container.style.display = 'none';
         });
      }, [showMail]);
      
      const [showQuote, setShowQuote] = useState(false);
      const toggleQuote = () => {
         // add hidden class to div div gmail_quote gmail_quote_container
         const quoteContainer = email.current.querySelector('.gmail_quote_container');
         if (quoteContainer) {
            if (quoteContainer.style.display === 'none') {
               quoteContainer.style.display = 'block';
               setShowQuote(true);
            }
            else {
               quoteContainer.style.display = 'none';
               setShowQuote(false);
            }
         }
      };

      return <>
         {showMail?
         <div ref={email} className=' cursor-pointer mb-2 border-b border-gray-200 pb-2'>
            <div onClick={() => setShowMail(!showMail)} className='flex justify-between items-start'>
               <div  >
                  <h2 className='m-0 mb-0 font-bold text-normal '>{e.from}</h2>
                  <p className='text-gray-500 mt-0'>to : {e.to}</p>
               </div>
               <div className='text-gray-500 mt-2'>{new Date(e.date).toLocaleString()}</div>
            </div>
            <div className='text-gray-500 mt-6' dangerouslySetInnerHTML={{ __html: e.body.rawHtml }}></div>
            {!showQuote && <button onClick={toggleQuote} className='text-grey-500 bg-gray-200s px-3 ps-0  flex items-center rounded-full'>
               <span className='relative block text-3xl'>...</span>
            </button>}

         </div>
         :
         <div onClick={() => setShowMail(!showMail)} className=' cursor-pointer mb-2 border-b border-gray-200 pb-2'>
            <div  className='flex justify-between items-start'>
               <h2 className='m-0 mb-0 font-bold text-normal '>{e.from}</h2>
               <div className='text-gray-500'>{new Date(e.date).toLocaleString()}</div>
            </div>
            <div className='text-gray-500 mt-2 line-clamp-1'>{e.body.textBlocks}</div>
         </div>
         }
      </>
  }

  return (
   <AuthLayout>
         <h2 className="heading">{data.subject ?? 'Unknown Subject'}</h2>
         <div className="space-y-3 pt-6">
            {data.innermail.map((e) => (
               <ITEM key={e.id} e={e} />
            ))}
         </div>
   </AuthLayout>
  );
};

