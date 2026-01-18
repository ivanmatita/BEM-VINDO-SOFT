
import React, { useState, useMemo } from 'react';
import { Purchase, PurchaseType, Company } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadExcel } from "../utils/exportUtils";
import { Printer, FileSpreadsheet, Calculator, Calendar, Search, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WithholdingToPayProps {
  purchases: Purchase[];
  company: Company;
}

const WithholdingToPay: React.FC<WithholdingToPayProps> = ({ purchases, company }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const withholdingData = useMemo(() => {
    return purchases.filter(p => {
      const d = new Date(p.date);
      // Simplified check for withholding on purchases (Assume specific items marked with withholding or just all FR/FT with total above threshold)
      const hasWithholding = p.items.some(item => item.withholdingAmount && item.withholdingAmount > 0);
      return (
        p.status !== 'CANCELLED' &&
        hasWithholding &&
        d.getFullYear() === year &&
        (d.getMonth() + 1) === month
      );
    }).map(p => {
        const totalBase = p.subtotal;
        const totalWithholding = p.items.reduce((acc, item) => acc + (item.withholdingAmount || 0), 0);
        return {
            id: p.id,
            nif: p.nif,
            prestador: p.supplier,
            docNo: p.documentNumber,
            dataEmissao: p.date,
            dataPagamento: p.date, // Assuming payment on date for this view
            valorTotal: p.total,
            valorPago: p.status === 'PAID' ? p.total : 0,
            valorSujeito: totalBase,
            taxa: '6.5%',
            impostoRetido: totalWithholding
        };
    });
  }, [purchases, year, month]);

  const totals = withholdingData.reduce((acc, row) => ({
    total: acc.total + row.valorTotal,
    pago: acc.pago + row.valorPago,
    sujeito: acc.sujeito + row.valorSujeito,
    retido: acc.retido + row.impostoRetido
  }), { total: 0, pago: 0, sujeito: 0, retido: 0 });

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-20 animate-in fade-in" id="withholdingPayArea">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-orange-600"/> Retenção na Fonte a Pagar (Compras)
          </h1>
          <p className="text-xs text-slate-500">Declaração de retenções efetuadas a fornecedores</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadExcel("withholdingPayTable", `Retencao_Pagar_${month}_${year}`)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs hover:bg-green-700 transition shadow-md">
            <FileSpreadsheet size={16}/> Excel
          </button>
          <button onClick={() => printDocument("withholdingPayArea")} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs hover:bg-black transition shadow-md">
            <Printer size={16}/> Imprimir
          </button>
        </div>
      </div>

      {/* Main Map Box - Visual Style matched to Screenshot_20260118-141544.jpg */}
      <div className="bg-white p-10 max-w-[1200px] mx-auto shadow-2xl border-2 border-slate-300 font-sans">
        
        {/* Superior Header */}
        <div className="flex border-2 border-slate-800 mb-6">
            <div className="w-48 p-4 border-r-2 border-slate-800 flex flex-col items-center justify-center bg-slate-50">
                <div className="text-blue-600 font-black text-2xl"><Building2 size={32}/></div>
                <div className="text-[9px] font-black text-slate-600 uppercase text-center mt-1 leading-none">Powered By<br/>Afrogest™</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-tight">Declaração de Retenção na Fonte</h1>
                <h2 className="text-lg font-black text-blue-800 uppercase">IMPOSTO INDUSTRIAL {year}</h2>
            </div>
            <div className="w-48 p-4 border-l-2 border-slate-800 flex flex-col items-center justify-center relative">
                 <div className="w-20 h-20 border-2 border-blue-900 rounded-xl flex flex-col items-center justify-center p-1 bg-slate-50 shadow-inner">
                    <ShieldCheck className="text-blue-900" size={32}/>
                    <span className="text-[8px] font-black uppercase text-blue-900 text-center mt-1">Logo Empresa</span>
                 </div>
            </div>
        </div>

        {/* Period Selector (Print Hidden Header Simulation) */}
        <div className="flex justify-end gap-4 mb-4 print:hidden">
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border">
                <Calendar size={16} className="text-slate-500"/>
                <select className="bg-transparent font-bold text-xs uppercase outline-none" value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <select className="bg-transparent font-bold text-xs outline-none" value={year} onChange={e => setYear(Number(e.target.value))}>
                    <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option>
                </select>
            </div>
        </div>

        {/* Taxpayer Information Block */}
        <div className="border-2 border-slate-800 mb-6 text-[11px]">
            <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase">01- IDENTIFICAÇÃO DO CONTRIBUINTE</div>
            <div className="p-4 space-y-2">
                <p className="font-black text-slate-800 uppercase">EMPRESA: <span className="ml-2 font-bold text-slate-600">{company.name}</span></p>
                <p className="font-black text-slate-800 uppercase">NIF: <span className="ml-2 font-bold font-mono text-slate-600">{company.nif}</span></p>
            </div>
        </div>

        {/* Table List Header */}
        <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase text-[11px] mb-0 border-x-2 border-t-2 border-slate-800">2 - LISTAGEM DE RETENÇÃO A FORNECEDORES</div>
        
        {/* Table View */}
        <div className="border-2 border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-[9px] border-collapse" id="withholdingPayTable">
                <thead className="bg-slate-50 font-black text-slate-700 border-b-2 border-slate-800 text-center uppercase">
                    <tr>
                        <th className="p-2 border-r border-slate-300 w-8" rowSpan={2}>Nº</th>
                        <th className="p-2 border-r border-slate-300 w-12" rowSpan={2}>NIF AO</th>
                        <th className="p-2 border-r border-slate-300 w-24" rowSpan={2}>NIF</th>
                        <th className="p-2 border-r border-slate-300" rowSpan={2}>Prestador</th>
                        <th className="p-2 border-r border-slate-300 w-8" rowSpan={2}>(a)</th>
                        <th className="p-2 border-r border-slate-300 w-8" rowSpan={2}>(b)</th>
                        <th className="p-1 border-b border-slate-300" colSpan={6}>Dados da factura</th>
                        <th className="p-2 border-r border-slate-300 w-10" rowSpan={2}>Taxa</th>
                        <th className="p-2 w-28" rowSpan={2}>Imposto Retido</th>
                    </tr>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[8px]">
                        <th className="p-1 border-r border-slate-300">Nº</th>
                        <th className="p-1 border-r border-slate-300">Data Emissão</th>
                        <th className="p-1 border-r border-slate-300">Data Pagamento</th>
                        <th className="p-1 border-r border-slate-300">Valor Total</th>
                        <th className="p-1 border-r border-slate-300">Valor Pago</th>
                        <th className="p-1 border-r border-slate-300">Valor Sujeito</th>
                    </tr>
                </thead>
                <tbody className="font-bold text-center uppercase">
                    {withholdingData.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors h-8 border-b border-slate-200">
                            <td className="p-1 border-r border-slate-300">{i + 1}</td>
                            <td className="p-1 border-r border-slate-300">---</td>
                            <td className="p-1 border-r border-slate-300 font-mono">{row.nif}</td>
                            <td className="p-1 border-r border-slate-300 text-left truncate max-w-[150px]">{row.prestador}</td>
                            <td className="p-1 border-r border-slate-300"></td>
                            <td className="p-1 border-r border-slate-300"></td>
                            <td className="p-1 border-r border-slate-300 font-mono">{row.docNo}</td>
                            <td className="p-1 border-r border-slate-300">{formatDate(row.dataEmissao)}</td>
                            <td className="p-1 border-r border-slate-300">{formatDate(row.dataPagamento)}</td>
                            <td className="p-1 border-r border-slate-300 text-right">{formatCurrency(row.valorTotal).replace('Kz','')}</td>
                            <td className="p-1 border-r border-slate-300 text-right">{formatCurrency(row.valorPago).replace('Kz','')}</td>
                            <td className="p-1 border-r border-slate-300 text-right font-black">{formatCurrency(row.valorSujeito).replace('Kz','')}</td>
                            <td className="p-1 border-r border-slate-300 text-red-600">{row.taxa}</td>
                            <td className="p-1 text-right font-black text-orange-700 bg-orange-50/20">{formatCurrency(row.impostoRetido).replace('Kz','')}</td>
                        </tr>
                    ))}
                    {/* Placeholder rows */}
                    {Array.from({length: Math.max(0, 12 - withholdingData.length)}).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-8 border-b border-slate-200">
                            <td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td className="border-r border-slate-300"></td><td></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-100 font-black text-xs">
                    <tr className="h-10 border-t-2 border-slate-800">
                        <td colSpan={9} className="text-right pr-6 uppercase tracking-widest text-[10px]">Totais Acumulados</td>
                        <td className="p-2 text-right border-x border-slate-300">{formatCurrency(totals.total).replace('Kz','')}</td>
                        <td className="p-2 text-right border-r border-slate-300">{formatCurrency(totals.pago).replace('Kz','')}</td>
                        <td className="p-2 text-right border-r border-slate-300 font-black text-slate-900">{formatCurrency(totals.sujeito).replace('Kz','')}</td>
                        <td className="p-2 border-r border-slate-300"></td>
                        <td className="p-2 text-right font-black text-orange-900 bg-orange-100/50">{formatCurrency(totals.retido).replace('Kz','')}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* Legend from Screenshot */}
        <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-1 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
            <p>(a) Nº da Declaração de Conformidade</p>
            <p>(b) Sector Petrolífero</p>
        </div>

        <div className="mt-12 flex justify-between items-center text-[8px] font-mono text-slate-400 italic">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-900 opacity-20"/>
                <span>Software Certificado nº 25/AGT/2019 • Imatec Software V.2.0</span>
            </div>
            <div className="text-right font-black">Data Emissão: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default WithholdingToPay;
