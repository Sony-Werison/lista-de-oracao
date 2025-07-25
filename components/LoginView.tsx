import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !auth) return;

    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: any) {
       switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email ou senha inválidos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este email já está cadastrado. Tente fazer login.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        case 'auth/invalid-api-key':
            setError('A chave da API do Firebase é inválida. Verifique a configuração.');
            break;
        default:
          setError('Ocorreu um erro. Tente novamente.');
          console.error(err);
      }
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-color)] p-4">
      <div className="w-full max-w-sm mx-auto animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isSignUp ? 'Crie Sua Conta' : 'Diário de Oração'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isSignUp ? 'Preencha os campos para começar.' : 'Bem-vindo(a) de volta! Faça login para continuar.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] shadow-2xl rounded-lg p-8 space-y-6 border border-[var(--border-color)]">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
              required
              autoFocus
            />
          </div>
          <div>
             <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-md p-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={!email || !password || isLoading}
              className="w-full px-6 py-3 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-color)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </div>
        </form>
         <div className="text-center mt-6">
            <button onClick={toggleMode} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                <span className="font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)]">{isSignUp ? 'Entrar' : 'Cadastre-se'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;