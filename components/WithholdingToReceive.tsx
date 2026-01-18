
import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceType, Company, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadExcel } from "../utils/exportUtils";
import { Printer, FileSpreadsheet, Calculator, Calendar, Search, ShieldAlert } from 'lucide-react';

interface WithholdingToReceiveProps {
  invoices: Invoice[];
  company: Company;
}

const WithholdingToReceive: React.FC<WithholdingToReceiveProps> = ({ invoices, company }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const withholdingData = useMemo(() => {
    return invoices.filter(inv => {
      const d = new Date(inv.date);
      return (
        inv.isCertified &&
        inv.status !== InvoiceStatus.CANCELLED &&
        inv.withholdingAmount && inv.withholdingAmount > 0 &&
        d.getFullYear() === year &&
        (d.getMonth() + 1) === month
      );
    }).map(inv => {
        const isNC = inv.type === InvoiceType.NC;
        return {
            id: inv.id,
            cliente: inv.clientName,
            dataDoc: inv.date,
            docNo: inv.number,
            tipo: inv.type,
            taxa: '6.5%',
            impostoBase: inv.subtotal,
            notaCredito: isNC ? inv.withholdingAmount : 0,
            impAReceber: isNC ? 0 : inv.withholdingAmount
        };
    });
  }, [invoices, year, month]);

  const totals = withholdingData.reduce((acc, row) => ({
    base: acc.base + row.impostoBase,
    nc: acc.nc + (row.notaCredito || 0),
    receber: acc.receber + (row.impAReceber || 0)
  }), { base: 0, nc: 0, receber: 0 });

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-20 animate-in fade-in" id="withholdingReceiveArea">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-blue-600"/> Retenção na Fonte a Receber (Vendas)
          </h1>
          <p className="text-xs text-slate-500">Listagem de retenções efetuadas por clientes no período</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadExcel("withholdingReceiveTable", `Retencao_Receber_${month}_${year}`)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs hover:bg-green-700 transition shadow-md">
            <FileSpreadsheet size={16}/> Excel
          </button>
          <button onClick={() => printDocument("withholdingReceiveArea")} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs hover:bg-black transition shadow-md">
            <Printer size={16}/> Imprimir
          </button>
        </div>
      </div>

      {/* Main Map Box - Visual Style matched to Screenshot */}
      <div className="bg-white p-8 max-w-[1200px] mx-auto shadow-2xl border-4 border-slate-300 font-sans">
        
        {/* Header Section */}
        <div className="flex border-2 border-slate-800 mb-4">
            <div className="w-48 p-4 border-r-2 border-slate-800 flex flex-col items-center justify-center bg-slate-50">
                <div className="text-blue-600 font-black text-2xl"><ShieldAlert size={32}/></div>
                <div className="text-[9px] font-black text-slate-600 uppercase text-center mt-1 leading-none">Powered By<br/>Afrogest™</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Retenções na Fonte</h1>
                <h2 className="text-lg font-black text-blue-800 uppercase">A Receber de Clientes</h2>
            </div>
            <div className="w-48 p-4 border-l-2 border-slate-800 flex flex-col items-center justify-center">
                <div className="border-4 border-double border-blue-900 rounded-full w-16 h-16 flex items-center justify-center font-serif font-bold text-blue-900 italic text-xl">IVA</div>
            </div>
        </div>

        {/* Filters and Company Info */}
        <div className="grid grid-cols-12 border-2 border-slate-800 mb-4 h-24 text-[10px]">
            <div className="col-span-3 border-r-2 border-slate-800 flex flex-col">
                <div className="bg-blue-900 text-white px-2 py-0.5 font-bold">01 - REGIME DO IVA</div>
                <div className="p-2 space-y-1 mt-1">
                    <div className="flex items-center gap-2 font-bold"><div className="w-3 h-3 border border-black rounded-sm"></div> REGIME GERAL</div>
                    <div className="flex items-center gap-2 font-bold"><div className="w-3 h-3 border border-black rounded-sm"></div> REGIME DE CAIXA</div>
                    <div className="flex items-center gap-2 font-bold"><div className="w-3 h-3 border border-black rounded-sm"></div> REGIME TRANSITORIO</div>
                </div>
            </div>
            <div className="col-span-5 border-r-2 border-slate-800 flex flex-col">
                <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase">02 - PERIODO DA DECLARAÇÃO</div>
                <div className="p-3 flex gap-8 items-center h-full">
                    <div className="flex gap-2 items-center">
                        <span className="text-slate-500 font-bold">Ano:</span>
                        <select className="border-2 border-black font-black text-sm px-2 bg-transparent outline-none cursor-pointer" value={year} onChange={e => setYear(Number(e.target.value))}>
                            <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-slate-500 font-bold">Mês:</span>
                        <select className="border-2 border-black font-black text-sm px-2 bg-transparent outline-none cursor-pointer" value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {months.map((m, i) => <option key={i} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                        </select>
                        <span className="ml-2 font-black uppercase text-slate-400">({months[month-1]})</span>
                    </div>
                </div>
            </div>
            <div className="col-span-4 flex flex-col">
                <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase">03 - NÚMERO DE IDENTIFICAÇÃO FISCAL</div>
                <div className="flex items-center justify-center gap-1 h-full pb-2">
                    {company.nif.split('').map((char, i) => (
                        <div key={i} className="border-2 border-black w-6 h-8 flex items-center justify-center font-black text-sm bg-slate-50">{char}</div>
                    ))}
                </div>
            </div>
        </div>

        {/* Taxpayer Name */}
        <div className="border-2 border-slate-800 mb-4 text-[10px]">
            <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase">04 - IDENTIFICAÇÃO DO CONTRIBUINTE</div>
            <div className="p-2 flex gap-4 items-center">
                <span className="font-black text-blue-900 whitespace-nowrap">1 - NOME OU DESIGNAÇÃO SOCIAL:</span>
                <div className="flex-1 font-black text-sm uppercase border-b border-black">{company.name}</div>
            </div>
        </div>

        {/* Main Table */}
        <div className="border-2 border-slate-800 overflow-hidden">
            <div className="bg-blue-900 text-white px-2 py-0.5 font-bold uppercase text-[10px]">9 - Retenções na Fonte a Receber</div>
            <table className="w-full text-left text-[10px] border-collapse" id="withholdingReceiveTable">
                <thead className="bg-slate-50 font-black text-slate-600 border-b-2 border-slate-800 text-center uppercase">
                    <tr>
                        <th className="p-2 border-r w-10">Nº</th>
                        <th className="p-2 border-r text-left">Cliente</th>
                        <th className="p-2 border-r w-24">Data Doc</th>
                        <th className="p-2 border-r w-28">Doc Nº</th>
                        <th className="p-2 border-r w-16">Tipo</th>
                        <th className="p-2 border-r w-16">Taxa</th>
                        <th className="p-2 border-r w-28 text-right">Imposto Base</th>
                        <th className="p-2 border-r w-28 text-right">Nota Crédito</th>
                        <th className="p-2 w-32 text-right">IMP A RECEBER</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-bold uppercase text-center">
                    {withholdingData.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors h-8">
                            <td className="p-1.5 border-r border-slate-200">{i + 1}</td>
                            <td className="p-1.5 border-r border-slate-200 text-left truncate max-w-[200px]">{row.cliente}</td>
                            <td className="p-1.5 border-r border-slate-200 font-mono">{formatDate(row.dataDoc)}</td>
                            <td className="p-1.5 border-r border-slate-200 font-mono text-blue-800">{row.docNo}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold">{row.tipo}</td>
                            <td className="p-1.5 border-r border-slate-200 text-red-600">{row.taxa}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{formatCurrency(row.impostoBase).replace('Kz','')}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right text-red-600">{row.notaCredito > 0 ? formatCurrency(row.notaCredito).replace('Kz','') : '0,00'}</td>
                            <td className="p-1.5 text-right font-black text-blue-900 bg-blue-50/30">{row.impAReceber > 0 ? formatCurrency(row.impAReceber).replace('Kz','') : '0,00'}</td>
                        </tr>
                    ))}
                    {/* Filling empty rows for layout matching */}
                    {Array.from({length: Math.max(0, 15 - withholdingData.length)}).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-8 border-b border-slate-200">
                            <td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td className="border-r border-slate-200"></td><td></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-800 bg-slate-100 font-black uppercase text-xs">
                    <tr className="h-10">
                        <td colSpan={6} className="text-right pr-4 uppercase tracking-[3px] text-[10px]">Valores Totais</td>
                        <td className="p-2 text-right border-x border-slate-300">{formatCurrency(totals.base).replace('Kz','')}</td>
                        <td className="p-2 text-right border-r border-slate-300 text-red-600">{formatCurrency(totals.nc).replace('Kz','')}</td>
                        <td className="p-2 text-right font-black text-blue-900 bg-blue-100/50">{formatCurrency(totals.receber).replace('Kz','')}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div className="mt-8 flex justify-between items-end text-[9px] font-mono text-slate-400 italic">
            <div>Processado por computador | Software IMATEC v2.0 | Certificado nº 25/AGT/2019</div>
            <div className="font-bold">Página 1 de 1</div>
        </div>
      </div>
    </div>
  );
};

export default WithholdingToReceive;
