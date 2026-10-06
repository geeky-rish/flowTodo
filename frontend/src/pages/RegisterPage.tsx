import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex w-10 h-10 bg-primary-600 rounded-xl items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create your account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your tasks, organized around you.</p>
        </div>
        <div className="card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email <span className="font-normal text-zinc-400">(optional)</span></label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            </div>
            <div>
              <label className="label" htmlFor="confirmation">Confirm password</label>
              <input id="confirmation" className="input" type="password" minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <button className="btn btn-primary w-full justify-center" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Create account
            </button>
          </form>
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
            Already have an account? <Link className="text-primary-600 hover:underline" to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
