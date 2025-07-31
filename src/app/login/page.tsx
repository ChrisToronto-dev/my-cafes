'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Coffee, Mail, Key } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex items-center mb-8">
        <Coffee className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold ml-2 text-foreground">MyCafe</h1>
      </div>
      <div className="bg-card p-8 rounded-lg shadow-sm border border-border w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full rounded-md border-border pl-10 p-3 bg-background focus:border-primary focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="block w-full rounded-md border-border pl-10 p-3 bg-background focus:border-primary focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-center text-destructive">{error}</p>
          )}
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full inline-flex justify-center py-3 px-4 border border-border rounded-md shadow-sm bg-card text-foreground text-sm font-medium hover:bg-accent"
            >
              <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 24.4 169.3 63.4l-67.8 67.8C293.5 114.6 272.1 104 248 104c-73.6 0-134.3 60.3-134.3 134.3s60.7 134.3 134.3 134.3c83.8 0 119.2-64.2 122.7-97.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
