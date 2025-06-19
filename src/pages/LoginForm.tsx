import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { validators } from '@/utils/validators';
import { ROUTES } from '@/utils/constants';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { OAuthButtons } from '../components/auth/OAuthButtons';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>Welcome back</h2>
          <p className='mt-2 text-gray-600'>Sign in to your student account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div>
            <label htmlFor='email' className='label'>
              Email Address
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiMail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                {...register('email', { validate: validators.email })}
                type='email'
                id='email'
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                placeholder='Enter your email'
              />
            </div>
            {errors.email && (
              <p className='error-text'>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='password' className='label'>
              Password
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                id='password'
                className={`input pl-10 pr-10 ${
                  errors.password ? 'input-error' : ''
                }`}
                placeholder='Enter your password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center'
              >
                {showPassword ? (
                  <FiEyeOff className='h-5 w-5 text-gray-400' />
                ) : (
                  <FiEye className='h-5 w-5 text-gray-400' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='error-text'>{errors.password.message}</p>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className='text-sm text-primary-600 hover:text-primary-700'
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='btn btn-primary w-full flex items-center justify-center'
          >
            {isLoading ? <LoadingSpinner size='sm' /> : 'Sign In'}
          </button>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          <OAuthButtons />
        </div>

        <p className='mt-6 text-center text-sm text-gray-600'>
          Don't have an account?{' '}
          <Link to={ROUTES.SIGNUP} className='link'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
