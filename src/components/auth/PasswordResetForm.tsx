import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '@/services/auth.service';
import { validators } from '@/utils/validators';
import { ROUTES } from '@/utils/constants';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface RequestResetData {
  email: string;
}

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export const PasswordResetForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const requestForm = useForm<RequestResetData>();
  const resetForm = useForm<ResetPasswordData>();

  const password = resetForm.watch('password');

  const handleRequestReset = async (data: RequestResetData) => {
    try {
      setIsLoading(true);
      await authService.requestPasswordReset(data.email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    if (!token) return;

    try {
      setIsLoading(true);
      await authService.resetPassword({ token, password: data.password });
      toast.success('Password reset successfully');
      window.location.href = ROUTES.LOGIN;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    return (
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-gray-600'>Enter your new password below</p>
        </div>

        <form
          onSubmit={resetForm.handleSubmit(handleResetPassword)}
          className='space-y-6'
        >
          <div>
            <label htmlFor='password' className='label'>
              New Password
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                {...resetForm.register('password', {
                  validate: validators.password,
                })}
                type={showPassword ? 'text' : 'password'}
                id='password'
                className={`input pl-10 pr-10 ${
                  resetForm.formState.errors.password ? 'input-error' : ''
                }`}
                placeholder='Enter new password'
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
            {resetForm.formState.errors.password && (
              <p className='error-text'>
                {resetForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='confirmPassword' className='label'>
              Confirm New Password
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                {...resetForm.register('confirmPassword', {
                  validate: validators.confirmPassword(password),
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                className={`input pl-10 pr-10 ${
                  resetForm.formState.errors.confirmPassword
                    ? 'input-error'
                    : ''
                }`}
                placeholder='Confirm new password'
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
            {resetForm.formState.errors.confirmPassword && (
              <p className='error-text'>
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='btn btn-primary w-full flex items-center justify-center'
          >
            {isLoading ? <LoadingSpinner size='sm' /> : 'Reset Password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900'>
          Forgot your password?
        </h2>
        <p className='mt-2 text-gray-600'>
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {emailSent ? (
        <div className='text-center'>
          <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-green-800'>
              We've sent a password reset link to your email. Please check your
              inbox.
            </p>
          </div>
          <Link to={ROUTES.LOGIN} className='link inline-flex items-center'>
            <FiArrowLeft className='mr-2' />
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <form
            onSubmit={requestForm.handleSubmit(handleRequestReset)}
            className='space-y-6'
          >
            <div>
              <label htmlFor='email' className='label'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiMail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...requestForm.register('email', {
                    validate: validators.email,
                  })}
                  type='email'
                  id='email'
                  className={`input pl-10 ${
                    requestForm.formState.errors.email ? 'input-error' : ''
                  }`}
                  placeholder='Enter your email'
                />
              </div>
              {requestForm.formState.errors.email && (
                <p className='error-text'>
                  {requestForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='btn btn-primary w-full flex items-center justify-center'
            >
              {isLoading ? <LoadingSpinner size='sm' /> : 'Send Reset Link'}
            </button>
          </form>

          <p className='mt-6 text-center'>
            <Link to={ROUTES.LOGIN} className='link inline-flex items-center'>
              <FiArrowLeft className='mr-2' />
              Back to login
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
