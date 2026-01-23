
import React, { useState, useEffect } from 'react';
import { 
  Calculator, History, Trash2, Delete, 
  Percent, DollarSign, Scale, Hash, ArrowLeftRight
} from 'lucide-react';
import { formatCurrency } from '../utils';

const CalculatorView: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<{eq: string, res: string}[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (lastResult !== null) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(prev => prev === '0' ? num : prev + num);
    }
  };

  const handleOperator = (op: string) => {
    setLastResult(null);
    if (display === '0' && op === '-') {
      setDisplay('-');
      return;
    }
    setEquation(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // Use Function instead of eval for safer simple math
      const result = new Function(`return ${fullEq.replace('x', '*').replace('÷', '/')}`)();
      const formattedRes = String(Number(result.toFixed(4)));
      
      setHistory(prev => [{eq: fullEq, res: formattedRes}, ...prev].slice(0, 10));
      setDisplay(formattedRes);
      setEquation('');
      setLastResult(formattedRes);
    } catch (e) {
      setDisplay('Erro');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setLastResult(null);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const applyTax = (perc: number) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const res = val * (1 + perc / 100);
    setDisplay(String(res.toFixed(2)));
    setLastResult(String(res.toFixed(2)));
  };

  const applyWithholding = () => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const res = val * 0.065;
    setDisplay(String(res.toFixed(2)));
    setLastResult(String(res.toFixed(2)));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 animate-in fade-in duration-500 max-w-5xl mx-auto h-[calc(100vh-140px)]">
      {/* CALCULADORA PRINCIPAL */}
      <div className="flex-1 flex flex-col bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        {/* DISPLAY AREA */}
        <div className="flex-1 flex flex-col justify-end items-end mb-8 px-4">
          <div className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-2 h-6">
            {equation}
          </div>
          <div className="text-white text-6xl font-black tracking-tighter overflow-hidden whitespace-nowrap">
            {display}
          </div>
        </div>

        {/* BUTTONS GRID */}
        <div className="grid grid-cols-4 gap-4">
          {/* Top Row: Functions */}
          <button onClick={clear} className="h-16 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">AC</button>
          <button onClick={backspace} className="h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-all"><Delete size={20}/></button>
          <button onClick={() => applyTax(14)} className="h-16 rounded-2xl bg-blue-600/10 text-blue-400 font-black text-[10px] uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all">IVA 14%</button>
          <button onClick={() => handleOperator('/')} className="h-16 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all">÷</button>

          {/* Numbers & Ops */}
          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="h-16 rounded-2xl bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('*')} className="h-16 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all">x</button>

          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="h-16 rounded-2xl bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('-')} className="h-16 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all">-</button>

          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => handleNumber(String(n))} className="h-16 rounded-2xl bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('+')} className="h-16 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all">+</button>

          <button onClick={applyWithholding} className="h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 font-black text-[10px] uppercase tracking-tighter hover:bg-indigo-600 hover:text-white transition-all">RET. 6.5%</button>
          <button onClick={() => handleNumber('0')} className="h-16 rounded-2xl bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-all">0</button>
          <button onClick={() => handleNumber('.')} className="h-16 rounded-2xl bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-all">.</button>
          <button onClick={calculate} className="h-16 rounded-2xl bg-emerald-500 text-white font-black text-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">=</button>
        </div>
      </div>

      {/* HISTÓRICO E INFO */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
            <History size={16} className="text-blue-600"/> Histórico Recente
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {history.map((h, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-right duration-300">
                <p className="text-[10px] font-mono text-slate-400 mb-1">{h.eq} =</p>
                <p className="font-black text-slate-800 text-lg">{h.res}</p>
              </div>
            ))}
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                <Hash size={32}/>
                <p className="text-[10px] font-black uppercase">Vazio</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setHistory([])}
            className="mt-4 w-full py-2 text-red-500 hover:bg-red-50 rounded-xl transition text-[10px] font-black uppercase tracking-widest"
          >
            Limpar Histórico
          </button>
        </div>

        <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-xl">
          <h4 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
            <Scale size={18}/> Guia Rápido Fiscal
          </h4>
          <ul className="space-y-3 text-[10px] font-bold uppercase tracking-tight">
            <li className="flex justify-between border-b border-white/20 pb-1"><span>IVA Normal</span> <span>14%</span></li>
            <li className="flex justify-between border-b border-white/20 pb-1"><span>IVA Reduzido</span> <span>7%</span></li>
            <li className="flex justify-between border-b border-white/20 pb-1"><span>Retenção Industrial</span> <span>6.5%</span></li>
            <li className="flex justify-between border-b border-white/20 pb-1"><span>Imposto Selo Recibo</span> <span>1%</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
