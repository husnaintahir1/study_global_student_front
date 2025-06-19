// src/pages/OAuthSuccess.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Method 1: Using React Router's useSearchParams (recommended)
    let token = searchParams.get('token');
    let userEncoded = searchParams.get('user');

    // Method 2: Fallback to direct URL parsing if React Router fails
    if (!token || !userEncoded) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      userEncoded = urlParams.get('user');
    }

    // Method 3: Alternative parsing if hash is used instead of search
    if (!token || !userEncoded) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        token = hashParams.get('token');
        userEncoded = hashParams.get('user');
      }
    }

    console.log('Token:', token);
    console.log('User encoded:', userEncoded);
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);

    if (!token || !userEncoded) {
      console.error('Missing token or user:', { token, userEncoded });
      // Don't navigate immediately, let's debug first
      console.log('All available URL parts:', {
        href: window.location.href,
        search: window.location.search,
        hash: window.location.hash,
        pathname: window.location.pathname,
      });
      navigate('/login');
      return;
    }

    try {
      let user;

      // Check if userEncoded is already a JSON string or needs decoding
      if (userEncoded.startsWith('{')) {
        // Already decoded JSON string
        user = JSON.parse(userEncoded);
      } else {
        // URL encoded, needs decoding first
        const userDecoded = decodeURIComponent(userEncoded);
        user = JSON.parse(userDecoded);
      }

      console.log('Parsed user:', user);

      localStorage.setItem('student_auth_token', token);
      localStorage.setItem('student_user_data', JSON.stringify(user));

      console.log(
        'Successfully stored token and user, navigating to dashboard'
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Error parsing user data:', err);
      console.error('User encoded value:', userEncoded);
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;
