import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { validators } from '@/utils/validators';
import { ROUTES } from '@/utils/constants';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { OAuthButtons } from './OAuthButtons';

interface SignupFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...signupData } = data;
      await signup(signupData);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900'>Create an account</h2>
        <p className='mt-2 text-gray-600'>Start your study abroad journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label htmlFor='name' className='label'>
            Full Name
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiUser className='h-5 w-5 text-gray-400' />
            </div>
            <input
              {...register('name', { validate: validators.required('Name') })}
              type='text'
              id='name'
              className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
              placeholder='Enter your full name'
            />
          </div>
          {errors.name && <p className='error-text'>{errors.name.message}</p>}
        </div>

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
          {errors.email && <p className='error-text'>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor='phone' className='label'>
            Phone Number (Optional)
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiPhone className='h-5 w-5 text-gray-400' />
            </div>
            <input
              {...register('phone', { validate: validators.phone })}
              type='tel'
              id='phone'
              className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
              placeholder='Enter your phone number'
            />
          </div>
          {errors.phone && <p className='error-text'>{errors.phone.message}</p>}
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
              {...register('password', { validate: validators.password })}
              type={showPassword ? 'text' : 'password'}
              id='password'
              className={`input pl-10 pr-10 ${
                errors.password ? 'input-error' : ''
              }`}
              placeholder='Create a password'
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

        <div>
          <label htmlFor='confirmPassword' className='label'>
            Confirm Password
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiLock className='h-5 w-5 text-gray-400' />
            </div>
            <input
              {...register('confirmPassword', {
                validate: validators.confirmPassword(password),
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmPassword'
              className={`input pl-10 pr-10 ${
                errors.confirmPassword ? 'input-error' : ''
              }`}
              placeholder='Confirm your password'
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
            >
              {showConfirmPassword ? (
                <FiEyeOff className='h-5 w-5 text-gray-400' />
              ) : (
                <FiEye className='h-5 w-5 text-gray-400' />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='error-text'>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='btn btn-primary w-full flex items-center justify-center'
        >
          {isLoading ? <LoadingSpinner size='sm' /> : 'Create Account'}
        </button>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>Or sign up with</span>
          </div>
        </div>

        <OAuthButtons />
      </div>

      <p className='mt-6 text-center text-sm text-gray-600'>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className='link'>
          Sign in
        </Link>
      </p>
    </div>
  );
};
