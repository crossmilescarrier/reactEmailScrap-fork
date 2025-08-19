import React from 'react'

export default function Loading({fixed, text}) {
  return (
    <div className={`w-full px-12 py-20 flex justify-center ${fixed ? 'fixed top-0 z-50 flex justify-center items-center h-full bg-[#0004] left-0' : ''}`}>
      <style>{`
      /* From Uiverse.io by vk-uiux */ 
      .loader {
        position: relative;
        width: 33px;
        height: 33px;
        perspective: 67px;
      }

      .loader div {
        width: 100%;
        height: 100%;
        background: #0008;
        position: absolute;
        left: 50%;
        transform-origin: left;
        animation: loader 2s infinite;
      }

      .loader div:nth-child(1) {
        animation-delay: 0.15s;
      }

      .loader div:nth-child(2) {
        animation-delay: 0.3s;
      }

      .loader div:nth-child(3) {
        animation-delay: 0.45s;
      }

      .loader div:nth-child(4) {
        animation-delay: 0.6s;
      }

      .loader div:nth-child(5) {
        animation-delay: 0.75s;
      }

      @keyframes loader {
        0% {
          transform: rotateY(0deg);
        }

        50%, 80% {
          transform: rotateY(-180deg);
        }

        90%, 100% {
          opacity: 0;
          transform: rotateY(-180deg);
        }
      }
       `}</style>
       <div>
        <div class="loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className='text-center mt-8 text-gray-500 uppercase text-md'>{text || 'Loading...'}</p>
       </div>
    </div>
  )
}
