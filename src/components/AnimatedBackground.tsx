import React from 'react';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-300/30 blur-[100px] animate-blob mix-blend-multiply filter opacity-70"></div>
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-pink-300/30 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter opacity-70"></div>
        <div className="absolute -bottom-[40%] left-[20%] w-[70%] h-[70%] rounded-full bg-blue-300/30 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply filter opacity-70"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-yellow-200/30 blur-[100px] animate-blob animation-delay-6000 mix-blend-multiply filter opacity-70"></div>
      </div>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
    </div>
  );
};
