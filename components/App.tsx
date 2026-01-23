
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import PurchaseList from './PurchaseList';
import PurchaseForm from './PurchaseForm';
import ClientList from './ClientList';
import SupplierList from './SupplierList';
import Settings from './Settings';
import StockManager from './StockManager'; 
import TaxManager from './TaxManager';
import CostRevenueMap from './CostRevenueMap';
import RegularizationMap from './RegularizationMap';
import Model7 from './Model7';
import CashManager from './CashManager'; 
import HumanResources from './HumanResources'; 
import Employees from './Employees'; 
import Workspace from './Workspace';
import ProjectReport from './ProjectReport';
import SaftExport from './SaftExport';
import ManagementReports from './ManagementReports';
import AIAssistant from './AIAssistant';
import LoginPage from './LoginPage';
import POS from './POS';
import CashClosure from './CashClosure';
import CalculatorView from './CalculatorView';

import { supabase } from '../services/supabaseClient';

import { 
  Invoice, InvoiceStatus, ViewState, Client, Product, InvoiceType, 
  Warehouse, PriceTable, StockMovement, Purchase, Company, User,
  Employee, SalarySlip, HrTransaction, WorkLocation, CashRegister, DocumentSeries,
  Supplier, PaymentMethod, CashMovement, HrVacation, Profession, CashClosure as CashClosureType,
  IntegrationStatus, WorkProject, TaxRate, Bank, Metric
} from '../types';
import { Menu, Calendar as CalendarIcon, RefreshCw, Clock as ClockIcon, Loader2 } from 'lucide-react';
import { generateId, generateInvoiceHash, getDocumentPrefix, formatDate } from '../utils';

const DEFAULT_FALLBACK_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [series, setSeries] = useState<DocumentSeries[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [hrEmployees, setHrEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<SalarySlip[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitorar Estado da Sessão Supabase
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) handleSetSessionUser(session.user);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleSetSessionUser(session.user);
      else {
          setCurrentUser(null);
          setCurrentCompany(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetSessionUser = async (sbUser: any) => {
    setIsLoading(true);
    try {
        const companyId = sbUser.id; 
        
        const { data: compData } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', companyId)
            .single();

        if (compData) {
            setCurrentCompany({
                id: compData.id,
                name: compData.nome,
                nif: compData.nif,
                address: compData.morada || compData.endereco || 'Angola',
                email: compData.email,
                phone: compData.telefone,
                regime: compData.regime || 'Regime Geral',
                licensePlan: 'ENTERPRISE',
                status: compData.status || 'ACTIVE',
                validUntil: '2030-12-31',
                registrationDate: compData.created_at
            });

            setCurrentUser({
                id: sbUser.id,
                name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
                email: sbUser.email!,
                role: 'ADMIN',
                companyId: companyId,
                createdAt: sbUser.created_at,
                permissions: []
            });

            // Carregar dados isolados da empresa
            fetchCompanyData(companyId);
        }
    } catch (e) {
        console.error("Erro ao carregar dados da empresa:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const fetchCompanyData = async (empresaId: string) => {
      setIsLoading(true);
      try {
          // Exemplo de busca filtrada por empresa_id (O banco deve ter esse campo)
          const [invs, purs, clis, sups, prods] = await Promise.all([
              supabase.from('faturas').select('*').eq('empresa_id', empresaId),
              supabase.from('compras').select('*').eq('empresa_id', empresaId),
              supabase.from('clientes').select('*').eq('empresa_id', empresaId),
              supabase.from('fornecedores').select('*').eq('empresa_id', empresaId),
              supabase.from('produtos').select('*').eq('empresa_id', empresaId),
          ]);

          if (invs.data) setInvoices(invs.data.map(mapInvoiceFromDb));
          if (clis.data) setClients(clis.data.map(mapClientFromDb));
          if (prods.data) setProducts(prods.data.map(mapProductFromDb));
          // ... outros mapeamentos seguindo a mesma lógica
      } finally {
          setIsLoading(false);
      }
  };

  // Funções de Mapeamento (Exemplos mantendo estrutura existente)
  const mapInvoiceFromDb = (f: any): Invoice => ({
      id: f.id, 
      type: (f.tipo_fatura || 'FT') as any, 
      seriesId: f.serie_id || 's1', 
      number: f.numero_fatura || '---', 
      date: f.data_fatura, 
      dueDate: f.data_fatura,
      accountingDate: f.data_fatura,
      clientId: f.cliente_id,
      clientName: f.cliente_nome,
      clientNif: f.cliente_nif,
      items: f.items || [],
      subtotal: f.total - (f.iva || 0),
      globalDiscount: 0,
      taxRate: 14,
      taxAmount: f.iva || 0,
      total: f.total,
      currency: 'AOA',
      exchangeRate: 1,
      status: f.status === 'Pago' ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
      isCertified: !!f.hash,
      hash: f.hash || '',
      companyId: f.empresa_id
  });

  const mapClientFromDb = (c: any): Client => ({
      id: c.id, name: c.nome, vatNumber: c.nif, email: c.email, phone: c.telefone,
      address: c.endereco, city: c.localidade, country: 'Angola', accountBalance: 0,
      initialBalance: c.saldo_inicial || 0, clientType: c.tipo_cliente, province: c.provincia, transactions: []
  });

  const mapProductFromDb = (p: any): Product => ({
      id: p.id, name: p.nome, costPrice: p.preco || 0, price: (p.preco || 0) * 1.3,
      unit: 'un', stock: p.stock || 0, warehouseId: p.armazem_id, priceTableId: 'pt1'
  });

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        handleSetSessionUser(data.user);
    } catch (err: any) {
        alert("Erro no login: " + (err.message || "Credenciais Inválidas"));
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentCompany(null);
  };

  const renderView = () => {
    if (!currentUser || !currentCompany) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard invoices={invoices.filter(i => i.isCertified)} />;
      case 'INVOICES': 
        return <InvoiceList 
                  invoices={invoices} 
                  onDelete={() => {}} 
                  onUpdate={() => {}}
                  onLiquidate={() => {}}
                  onCancelInvoice={() => {}}
                  onCertify={() => {}}
                  onCreateNew={() => setCurrentView('CREATE_INVOICE')}
                  onCreateDerived={() => {}}
                  onUpload={() => {}}
                  onViewReports={() => {}}
                  onQuickUpdate={() => {}}
                  onViewClientAccount={() => {}}
                  currentCompany={currentCompany}
                  workLocations={workLocations}
                  cashRegisters={cashRegisters}
                  series={series}
                  currentUser={currentUser}
               />;
      case 'CREATE_INVOICE':
        return <InvoiceForm 
                  onSave={() => setCurrentView('INVOICES')} 
                  onCancel={() => setCurrentView('INVOICES')} 
                  onViewList={() => setCurrentView('INVOICES')}
                  onAddWorkLocation={() => {}}
                  onSaveClient={() => {}}
                  onSaveWorkLocation={() => {}}
                  clients={clients} 
                  products={products}
                  workLocations={workLocations}
                  cashRegisters={cashRegisters}
                  series={series}
                  warehouses={warehouses}
                  currentCompany={currentCompany}
               />;
      case 'CLIENTS':
        return <ClientList clients={clients} onSaveClient={() => {}} initialSelectedClientId={null} />;
      case 'STOCK':
        return <StockManager 
                  products={products} 
                  setProducts={setProducts} 
                  warehouses={warehouses} 
                  setWarehouses={setWarehouses} 
                  priceTables={[]} 
                  setPriceTables={() => {}} 
                  movements={[]} 
                  onStockMovement={() => {}}
                  onCreateDocument={() => {}}
                  onOpenReportOverlay={() => {}}
               />;
      case 'SETTINGS':
        return <Settings 
                  series={series} 
                  onSaveSeries={() => {}} 
                  onEditSeries={() => {}}
                  users={[]} 
                  onSaveUser={() => {}} 
                  onDeleteUser={() => {}}
                  workLocations={workLocations}
                  onSaveWorkLocation={() => {}}
                  onDeleteWorkLocation={() => {}}
                  cashRegisters={cashRegisters}
                  onSaveCashRegister={() => {}}
                  onDeleteCashRegister={() => {}}
                  onTaxRatesUpdate={() => {}}
                  currentCompany={currentCompany}
                  onSaveCompany={() => {}}
               />;
      case 'CALCULATOR': return <CalculatorView />;
      default: return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo em carregamento...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {currentUser && (
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        {currentUser && (
          <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 shadow-sm shrink-0 z-10">
            <div className="flex items-center gap-6">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"><Menu /></button>
               <div className="hidden lg:block">
                  <h2 className="font-black text-lg text-slate-900 leading-none">IMATEC SOFTWARE</h2>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[2px] mt-1">Gestão Multiempresa</p>
               </div>
               <div className="hidden xl:flex flex-col border-l pl-6 border-slate-200">
                   <h2 className="font-bold text-slate-700 text-sm truncate max-w-[300px] uppercase tracking-tight">{currentCompany?.name}</h2>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg">
                   <ClockIcon size={16} className="text-blue-400 animate-pulse"/>
                   <span className="font-mono font-bold text-xs tracking-widest">{currentTime.toLocaleTimeString('pt-AO', { hour12: false })}</span>
               </div>
               <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                   <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{currentUser?.role}</p>
                   </div>
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black shadow-lg">{(currentUser?.name || 'A').charAt(0)}</div>
               </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6 relative bg-slate-50">
           {renderView()}
        </main>
      </div>
      {currentUser && <AIAssistant invoices={invoices} purchases={purchases} clients={clients} />}
    </div>
  );
};

export default App;
