
import React, { useState, useMemo } from 'react';
import { 
  Lock, Mail, CheckCircle, ArrowRight, Building2, User, Eye, EyeOff, Loader2,
  Users, MessageSquare, Calculator, ShoppingBag, ShieldCheck,
  ChevronRight, X, ArrowLeft, Check, Plus, AlertTriangle, MapPin, Zap
} from 'lucide-react';
import { Company, User as UserType, LicensePlan, RegistrationStep, RegistrationFormData } from '../types';
import { formatCurrency, generateId } from '../utils';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister?: (company: Company, user: UserType) => void;
}

// --- SUB-COMPONENTES MOVIDOS PARA FORA PARA CORRIGIR O ERRO DE DIGITAÇÃO ---

const FeaturesGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 py-16">
      {[
          { icon: <Calculator className="text-blue-500"/>, title: "Contabilidade", desc: "Apuramento automático de impostos e balancetes." },
          { icon: <ShoppingBag className="text-emerald-500"/>, title: "Stock", desc: "Controle rigoroso de inventário em tempo real." },
          { icon: <ShieldCheck className="text-indigo-500"/>, title: "Faturação", desc: "Emissão de documentos certificada pela AGT." },
          { icon: <Users className="text-orange-500"/>, title: "Recursos Humanos", desc: "Gestão completa de salários e pessoal." },
      ].map((feat, idx) => (
          <div key={idx} className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {React.cloneElement(feat.icon as React.ReactElement, { size: 24 })}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-tight">{feat.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
          </div>
      ))}
  </div>
);

const RegisterModal: React.FC<{
  regStep: RegistrationStep;
  regFormData: RegistrationFormData;
  setRegFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  setRegStep: React.Dispatch<React.SetStateAction<RegistrationStep>>;
  onClose: () => void;
  onFinalize: () => void;
  isLoading: boolean;
  currentStepValue: number;
}> = ({ regStep, regFormData, setRegFormData, setRegStep, onClose, onFinalize, isLoading, currentStepValue }) => {
  
  const planPrices: Record<LicensePlan, number> = {
    STARTER: 15000,
    PROFESSIONAL: 35000,
    ENTERPRISE: 85000
  };

  const handleNextStep = () => {
    if (regStep === 'COMPANY_INFO') {
        if (!regFormData.companyName || !regFormData.nif || !regFormData.adminName || !regFormData.email) {
            return alert("Por favor, preencha todos os campos obrigatórios.");
        }
        setRegStep('LICENSE_SELECTION');
    } else if (regStep === 'LICENSE_SELECTION') {
        setRegStep('CONFIRMATION');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
        <div 
          className="bg-white rounded-[1.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] relative z-[110]"
          onClick={e => e.stopPropagation()}
        >
            <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Building2 size={20}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">Registar Nova Empresa</h3>
                        <div className="flex gap-2 mt-1">
                            {['DADOS', 'LICENÇA', 'REVISÃO'].map((s, i) => (
                                <div key={i} className={`h-1 w-10 rounded-full ${
                                    (i === 0 && regStep === 'COMPANY_INFO') || 
                                    (i === 1 && regStep === 'LICENSE_SELECTION') || 
                                    (i === 2 && regStep === 'CONFIRMATION') 
                                    ? 'bg-emerald-500' : 'bg-slate-100'
                                  }`}></div>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {regStep === 'COMPANY_INFO' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right duration-300">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa *</label>
                            <input 
                              required 
                              type="text"
                              autoFocus
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.companyName} 
                              onChange={e => setRegFormData(prev => ({...prev, companyName: e.target.value}))} 
                              placeholder="Designação Social" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIF da Empresa *</label>
                            <input 
                              required 
                              type="text"
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-mono focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.nif} 
                              onChange={e => setRegFormData(prev => ({...prev, nif: e.target.value}))} 
                              placeholder="000000000" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Administrador *</label>
                            <input 
                              required 
                              type="text"
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.adminName} 
                              onChange={e => setRegFormData(prev => ({...prev, adminName: e.target.value}))} 
                              placeholder="Nome Completo" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                            <input 
                              type="text"
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.location} 
                              onChange={e => setRegFormData(prev => ({...prev, location: e.target.value}))} 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Principal *</label>
                            <input 
                              required 
                              type="email" 
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.email} 
                              onChange={e => setRegFormData(prev => ({...prev, email: e.target.value}))} 
                              placeholder="geral@empresa.ao" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Empresa</label>
                            <select 
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition appearance-none" 
                              value={regFormData.companyType} 
                              onChange={e => setRegFormData(prev => ({...prev, companyType: e.target.value}))}
                            >
                                <option>Comércio e Serviços</option><option>Serviços</option><option>Comércio</option><option>Restaurante</option><option>Hotelaria</option><option>Loja</option><option>Bar</option><option>Outros</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contacto</label>
                            <input 
                              type="text"
                              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl font-mono focus:border-emerald-500 focus:bg-white outline-none transition" 
                              value={regFormData.contact} 
                              onChange={e => setRegFormData(prev => ({...prev, contact: e.target.value}))} 
                              placeholder="+244" 
                            />
                        </div>
                    </div>
                )}

                {regStep === 'LICENSE_SELECTION' && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as LicensePlan[]).map(p => (
                                <div 
                                  key={p} 
                                  onClick={() => setRegFormData(prev => ({...prev, plan: p}))}
                                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${regFormData.plan === p ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                                >
                                    <h4 className="font-bold text-sm text-slate-600 uppercase mb-2 tracking-widest">{p}</h4>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(planPrices[p]).replace('Kz', '')}<span className="text-[10px] text-slate-400">/mês</span></p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Período de Faturação</label>
                            <div className="flex gap-2">
                                {([['MONTHLY', 'Mensal'], ['QUARTERLY', 'Trimestral'], ['ANNUAL', 'Anual']] as any[]).map(([key, label]) => (
                                    <button 
                                      key={key}
                                      onClick={() => setRegFormData(prev => ({...prev, period: key}))}
                                      className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${regFormData.period === key ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between items-end border-t border-slate-200 pt-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Investimento Total</span>
                                <span className="text-2xl font-black text-emerald-600">{formatCurrency(currentStepValue)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {regStep === 'CONFIRMATION' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-b pb-2 mb-4">Revisão de Dados</h4>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase">Empresa</p><p className="font-bold text-slate-800">{regFormData.companyName}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase">NIF</p><p className="font-mono font-bold text-blue-600">{regFormData.nif}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase">Administrador</p><p className="font-bold text-slate-800">{regFormData.adminName}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase">Email de Acesso</p><p className="font-bold text-slate-800">{regFormData.email}</p></div>
                                <div className="col-span-2 border-t pt-3"><p className="text-[9px] font-bold text-slate-400 uppercase">Plano Selecionado</p><p className="font-bold text-emerald-600 uppercase text-base">{regFormData.plan} - {regFormData.period}</p></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between gap-4 shrink-0 bg-white">
                {regStep !== 'COMPANY_INFO' ? (
                    <button onClick={() => setRegStep(regStep === 'CONFIRMATION' ? 'LICENSE_SELECTION' : 'COMPANY_INFO')} className="px-6 py-3 text-slate-400 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <ArrowLeft size={16}/> Anterior
                    </button>
                ) : <div></div>}
                
                <button 
                  onClick={regStep === 'CONFIRMATION' ? onFinalize : handleNextStep} 
                  disabled={isLoading}
                  className="bg-emerald-500 text-white px-10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-md hover:bg-emerald-600 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16}/> : (regStep === 'CONFIRMATION' ? 'Finalizar Registo' : 'Continuar')} 
                    <ArrowRight size={16}/>
                </button>
            </div>
        </div>
    </div>
  );
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Multi-step Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState<RegistrationStep>('COMPANY_INFO');
  const [regFormData, setRegFormData] = useState<RegistrationFormData>({
      companyName: '',
      nif: '',
      adminName: '',
      location: 'Luanda',
      address: '',
      contact: '',
      email: '',
      companyType: 'Comércio e Serviços',
      plan: 'STARTER',
      period: 'MONTHLY',
      planValue: 15000
  });

  const planPrices: Record<LicensePlan, number> = {
      STARTER: 15000,
      PROFESSIONAL: 35000,
      ENTERPRISE: 85000
  };

  const periodMultipliers = {
      MONTHLY: 1,
      QUARTERLY: 3,
      ANNUAL: 12
  };

  const currentStepValue = useMemo(() => {
      const base = planPrices[regFormData.plan] || 15000;
      const mult = periodMultipliers[regFormData.period] || 1;
      return base * mult;
  }, [regFormData.plan, regFormData.period]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            setIsLoading(false);
            return;
        }
        onLogin(email, password);
        setTimeout(() => setIsLoading(false), 500); 
    }, 1000);
  };

  const handleFinalizeRegistration = async () => {
      setIsLoading(true);
      try {
          const { data, error: supError } = await supabase
            .from('empresas')
            .insert({
                nome: regFormData.companyName,
                nif: regFormData.nif,
                email: regFormData.email,
                telefone: regFormData.contact,
                endereco: regFormData.location,
                plano: regFormData.plan,
                regime: 'Regime Geral',
                status: 'ACTIVE',
                validade: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            })
            .select();

          if (supError) throw supError;

          const newCompany: Company = {
              id: data[0].id,
              name: regFormData.companyName,
              nif: regFormData.nif,
              email: regFormData.email,
              phone: regFormData.contact,
              address: regFormData.location,
              regime: 'Regime Geral',
              licensePlan: regFormData.plan,
              status: 'ACTIVE',
              validUntil: data[0].validade,
              registrationDate: data[0].created_at
          };

          const newUser: UserType = {
              id: generateId(),
              name: regFormData.adminName,
              email: regFormData.email,
              password: '123',
              role: 'ADMIN',
              companyId: newCompany.id,
              permissions: [],
              createdAt: new Date().toISOString()
          };

          if (onRegister) onRegister(newCompany, newUser);
          
          alert(`Registo efetuado com sucesso!\nEnviamos os seus acessos para: ${regFormData.email}\nPalavra-passe padrão: 123`);
          
          setShowRegisterModal(false);
          setEmail(regFormData.email);
          setPassword('123');
      } catch (err: any) {
          alert("Erro ao registar na Cloud: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col relative overflow-x-hidden scroll-smooth">
      <style>{`
        .vibrant-hero-gradient {
            background: linear-gradient(to bottom, rgba(0, 51, 102, 0.88) 0%, rgba(0, 102, 204, 0.75) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
        }
        input::placeholder { color: #94a3b8; font-weight: 300; }
      `}</style>

      {/* HEADER */}
      <header className="fixed w-full top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003366] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">IM</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-none">IMATEC SOFTWARE</h1>
              <span className="text-[8px] font-bold text-blue-600 tracking-[2px] uppercase block mt-1">Sistemas de Gestão</span>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#inicio" className="hover:text-blue-600 transition-colors">Início</a>
            <a href="#sobre" className="hover:text-blue-600 transition-colors">Sobre Nós</a>
            <button onClick={() => setShowRegisterModal(true)} className="hover:text-blue-600 transition-colors uppercase">Registar Empresa</button>
            <a href="#contacto" className="hover:text-blue-600 transition-colors">Contacto</a>
            <a href="#login" className="hover:text-blue-600 transition-colors">Login</a>
          </nav>

          <div className="flex items-center gap-3">
             <button className="bg-[#0d1b2a] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm">ERP</button>
             <button onClick={() => setShowRegisterModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-md">
               Experimentar Grátis
             </button>
          </div>
        </div>
      </header>

      {/* HERO & LOGIN SECTION */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20 vibrant-hero-gradient">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
              <div className="text-white space-y-8 animate-in slide-in-from-left duration-700">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[9px] font-bold uppercase tracking-[2px] border border-blue-400/20">Software Certificado AGT</span>
                  <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                      Bem-vindo ao <br/>
                      <span className="text-cyan-300 uppercase">IMATEC SOFTWARE</span>
                  </h1>
                  <p className="text-base text-white/80 max-w-lg leading-relaxed font-light">
                      A solução completa para gestão empresarial em Angola. Faturação, Contabilidade, Stocks e Recursos Humanos numa plataforma moderna, segura e intuitiva.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                      <button onClick={() => setShowRegisterModal(true)} className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2">
                        <Plus size={16}/> Registar Empresa
                      </button>
                      <a href="#login" className="px-8 py-3.5 bg-blue-600/30 hover:bg-blue-600/50 border border-white/20 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all backdrop-blur-sm flex items-center gap-2">
                        <Users size={16}/> Aceder ao Sistema
                      </a>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/20">
                      <div>
                          <p className="text-2xl font-black">5k+</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Empresas</p>
                      </div>
                      <div>
                          <p className="text-2xl font-black">99%</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Satisfação</p>
                      </div>
                      <div>
                          <p className="text-2xl font-black">24/7</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Suporte</p>
                      </div>
                  </div>
              </div>

              <div id="login" className="flex justify-center lg:justify-end animate-in slide-in-from-right duration-700">
                  <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md border border-white/20">
                      <div className="mb-8 text-left border-b border-slate-100 pb-6">
                          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Aceder à Conta</h2>
                          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1.5">Insira as suas credenciais para continuar</p>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-6">
                          {error && (
                              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-100">
                                  <AlertTriangle size={14}/> {error}
                              </div>
                          )}

                          <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                              <div className="relative group">
                                  <Mail className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700 text-sm" placeholder="exemplo@imatec.ao" />
                              </div>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Palavra-passe</label>
                              <div className="relative group">
                                  <Lock className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700 text-sm" placeholder="••••••••" />
                                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-300 hover:text-slate-500 transition-colors">
                                      {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                  </button>
                              </div>
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                                  <input type="checkbox" className="rounded-md border-slate-200 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                                  <span>Lembrar-me</span>
                              </label>
                              <button type="button" className="text-blue-600 hover:underline">Esqueceu a senha?</button>
                          </div>

                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#0d1b2a] hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 uppercase text-[10px] tracking-[2px]"
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={16}/> : (
                                <>Entrar no Sistema <ArrowRight size={14}/></>
                            )}
                          </button>
                      </form>

                      <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                              Ainda não tem conta? <button onClick={() => setShowRegisterModal(true)} className="text-emerald-600 font-bold hover:underline">Criar agora</button>
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* INFORMATION SECTIONS */}
      <section id="sobre" className="bg-white/95 py-20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 text-center mb-16">
              <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[4px] mb-3">Vantagens IMATEC</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">A solução ideal para <br/> elevar o seu negócio</h3>
          </div>
          <FeaturesGrid />
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-[#0d1b2a] text-slate-400 py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-sm">IM</div>
                  <span className="font-bold text-white text-sm tracking-tight uppercase">IMATEC SOFTWARE</span>
              </div>
              <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2"><MapPin size={14}/> Luanda, Angola</span>
                  <span className="flex items-center gap-2"><Mail size={14}/> suporte@imatec.ao</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest">
                  © 2025 IMATEC SOFTWARE
              </div>
          </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/244923000000" target="_blank" className="fixed bottom-6 right-6 z-[70] bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-bounce">
          <MessageSquare size={28}/>
      </a>

      {showRegisterModal && (
        <RegisterModal 
          regStep={regStep}
          regFormData={regFormData}
          setRegFormData={setRegFormData}
          setRegStep={setRegStep}
          onClose={() => setShowRegisterModal(false)}
          onFinalize={handleFinalizeRegistration}
          isLoading={isLoading}
          currentStepValue={currentStepValue}
        />
      )}
    </div>
  );
};

export default LoginPage;
