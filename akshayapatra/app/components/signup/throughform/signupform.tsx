'use client'
import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/app/components/general/input';
import Button from '@/app/components/general/Gradientbutton';

interface stepprops {
  setstep: (step: number) => void;
  step: number;
}


export const SignUp: React.FC<stepprops>  = ({
  step,
  setstep
}) => {
  // State for input fields (no changes here)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form submission handler (no changes here)
  const handleSignUp = useCallback(() => {
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    console.log({ fullName, email, password });
    // API call logic goes here
    setstep(step + 1);
    
  }, [fullName, email, password, confirmPassword, step, setstep]);

  // Login redirect handler (no changes here)
  const handleLoginRedirect = useCallback(() => {
    console.log("Redirecting to login...");
    // Router logic goes here
     // Assuming step 0 is the login page
  }, []);

  return (
   <div 
  className="min-h-screen w-full font-sans text-white" 
  style={{ 
    backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
  }}
>
      <div className="container mx-auto grid min-h-screen grid-cols-1 items-center gap-8 px-4 lg:grid-cols-2 lg:gap-16">
        
        {/* Left Side: Illustration (hidden on small screens) */}
        <div className="relative hidden h-full w-full items-center justify-center lg:flex">
          <Image
            src="/thesignuplogo.png" // Your illustration image
            alt="Sign Up Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Right Side: Form */}
        <div className="flex w-full items-center justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="w-full max-w-md rounded-2xl border-2 border-white/20 bg-black/2 p-8 shadow-2xl backdrop-blur-lg"
          >
            {/* Header */}
           <div className="mb-8 text-center">
  <h1 className="text-4xl font-medium  bg-clip-text text-transparent"
  style={{ 
    backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #EE6200, #EE6200)' 
  }}>
    Sign Up
  </h1>
  <p className="mt-2 text-sm text-gray-300">
    Please fill in the details to create an account.
  </p>
</div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-white focus:border-orange-500 focus:outline-none"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-white focus:border-orange-500 focus:outline-none"
              />
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
                <Image src="/signup/Hide.svg" alt="Toggle visibility" width={20} height={20} className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer"/>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-lg border border-[#2A1203] bg-[#1F0D05] px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
                <Image src="/signup/Hide.svg" alt="Toggle visibility" width={20} height={20} className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer"/>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-700 py-3 text-lg font-medium text-white transition-transform duration-200 hover:scale-105"
            >
              Sign Up
            </button>
          
            {/* Login Redirect */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <span onClick={handleLoginRedirect} className="cursor-pointer font-semibold text-orange-500 hover:underline">
                Log in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}