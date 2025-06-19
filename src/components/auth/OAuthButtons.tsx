import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { API_BASE_URL } from '@/utils/constants';

export const OAuthButtons: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  return (
    <div className='mt-6 grid grid-cols-2 gap-3'>
      <button
        type='button'
        onClick={handleGoogleLogin}
        className='btn btn-outline flex items-center justify-center'
      >
        <FcGoogle className='h-5 w-5 mr-2' />
        Google
      </button>

      <button
        type='button'
        onClick={handleFacebookLogin}
        className='btn btn-outline flex items-center justify-center'
      >
        <FaFacebook className='h-5 w-5 mr-2 text-blue-600' />
        Facebook
      </button>
    </div>
  );
};
