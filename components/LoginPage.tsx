
import React, { useState } from 'react';
import { 
  Lock, Mail, CheckCircle, ArrowRight, BarChart3, Shield, 
  Smartphone, Globe, Users, Zap, Layout, Headphones, 
  X, MapPin, Building2, Phone, User, RefreshCw
} from 'lucide-react';
import { Company, User as UserType, LicensePlan, CompanyStatus } from '../types';
import { generateId } from '../utils';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister?: (company: Company, user: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Registration State
  const [regForm, setRegForm] = useState({
      companyName: '',
      nif: '',
      email: '',
      phone: '',
      address: '',
      adminName: '',
      password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    onLogin(email, password);
    // Simulação de timeout caso falhe silenciosamente
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!regForm.companyName || !regForm.nif || !regForm.email || !regForm.adminName || !regForm.password) {
          alert("Por favor, preencha todos os campos obrigatórios.");
          return;
      }

      setIsLoading(true);
      try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
              email: regForm.email,
              password: regForm.password,
              options: {
                  data: {
                      name: regForm.adminName,
                      company_name: regForm.companyName
                  }
              }
          });

          if (authError) throw authError;

          if (authData.user) {
              const empresaId = authData.user.id; // Uso o ID do user como ID da empresa para simplificar RLS
              
              const { error: dbError } = await supabase.from('empresas').insert({
                  id: empresaId,
                  nome: regForm.companyName,
                  nif: regForm.nif,
                  email: regForm.email,
                  telefone: regForm.phone,
                  morada: regForm.address,
                  regime: 'Regime Geral',
                  status: 'ACTIVE'
              });

              if (dbError) throw dbError;

              alert("Registo efetuado com sucesso! Um e-mail de ativação foi enviado para " + regForm.email);
              setViewMode('LOGIN');
          }
      } catch (err: any) {
          alert("Erro no registo: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-900 flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes zoom-infinite {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-zoom-infinite {
          animation: zoom-infinite 30s infinite ease-in-out;
        }
      `}</style>

      {/* HEADER */}
      <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
              IM
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">IMATEC</h1>
              <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase block">Software</span>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
             <button onClick={() => setViewMode('REGISTER')} className="text-sm font-bold text-slate-600 hover:text-blue-600 uppercase tracking-widest transition">Adesão Cloud</button>
             <button onClick={() => setViewMode('LOGIN')} className="bg-blue-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-800 transition shadow-lg">Entrar</button>
          </div>
        </div>
      </header>

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center animate-zoom-infinite opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop")' }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black"></div>
      </div>

      {/* FORM CONTAINER */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-24">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden border border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
              
              {viewMode === 'LOGIN' ? (
                <>
                  <div className="mb-8">
                      <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-tighter">Aceder ao IMATEC</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Multi-Company Cloud System</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Administrativo</label>
                          <div className="relative">
                              <Mail className="absolute left-4 top-3.5 text-slate-300" size={18}/>
                              <input 
                                  type="email" 
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm"
                                  placeholder="admin@empresa.ao"
                              />
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Palavra-passe</label>
                          <div className="relative">
                              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18}/>
                              <input 
                                  type={showPassword ? "text" : "password"}
                                  required
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm"
                                  placeholder="••••••••"
                              />
                              <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600"
                              >
                                  {showPassword ? <Shield size={20}/> : <Shield size={20} className="opacity-30"/>}
                              </button>
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-xl flex justify-center items-center gap-3 disabled:opacity-70 uppercase tracking-[3px] text-xs mt-4"
                      >
                          {isLoading ? <Loader2 className="animate-spin" size={20}/> : <>Autenticar Agora <ArrowRight size={18}/></>}
                      </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                      <button onClick={() => setViewMode('REGISTER')} className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition">
                          Ainda não tem conta? <span className="text-blue-600">Registar Empresa</span>
                      </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                      <h2 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tighter">Registo Multiempresa</h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Crie o seu ambiente de gestão isolado</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nome da Empresa *</label>
                          <input required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs uppercase" placeholder="Ex: IMATEC Tecnologia Lda" value={regForm.companyName} onChange={e => setRegForm({...regForm, companyName: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">NIF *</label>
                              <input required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-mono text-xs" placeholder="000000000" value={regForm.nif} onChange={e => setRegForm({...regForm, nif: e.target.value})}/>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Telefone</label>
                              <input className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs" placeholder="+244" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})}/>
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Endereço Fiscal</label>
                          <input className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs" placeholder="Localização oficial" value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})}/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-1">E-mail Administrativo (Login) *</label>
                          <input type="email" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs" placeholder="admin@empresa.ao" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nome do Gestor *</label>
                          <input required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs uppercase" placeholder="Nome do Admin" value={regForm.adminName} onChange={e => setRegForm({...regForm, adminName: e.target.value})}/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Criar Palavra-passe *</label>
                          <input type="password" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-xs" placeholder="••••••••" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}/>
                      </div>

                      <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl hover:bg-emerald-700 shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 mt-2">
                          {isLoading ? <Loader2 className="animate-spin" size={16}/> : <><Zap size={16}/> Ativar Empresa Cloud</>}
                      </button>
                  </form>

                  <button onClick={() => setViewMode('LOGIN')} className="w-full mt-4 text-slate-400 font-bold text-[9px] uppercase hover:text-slate-600 transition flex items-center justify-center gap-2">
                      <ArrowLeft size={12}/> Voltar ao Login
                  </button>
                </>
              )}
          </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 p-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          © 2024 IMATEC SOFTWARE • SISTEMA DE GESTÃO CERTIFICADO AGT Nº 25/2019
      </footer>
    </div>
  );
};

// Fix: Loader2 correctly uses RefreshCw which is now imported above
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <RefreshCw className={className} size={size} />
);

const ArrowLeft = ({ size }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

export default LoginPage;
