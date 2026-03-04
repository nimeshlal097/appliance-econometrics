"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import TCOChart from "@/components/TCOChart";
import JustificationPanel from "@/components/JustificationPanel";
import EconomicIndicesPanel from "@/components/EconomicIndicesPanel";
import {
  Calculator, Zap, PiggyBank, AlertCircle, ChevronDown, TrendingUp,
  Refrigerator, Tv, Wind, WashingMachine
} from "lucide-react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  refrigerator: { label: "Refrigerator", icon: Refrigerator, color: "blue" },
  washing_machine: { label: "Washing Machine", icon: WashingMachine, color: "cyan" },
  air_conditioner: { label: "Air Conditioner", icon: Wind, color: "sky" },
  television: { label: "Television", icon: Tv, color: "violet" },
};

const COLOR_CLASSES: Record<string, { ring: string; text: string; bg: string; border: string }> = {
  blue: { ring: "focus:ring-blue-500/20", text: "text-blue-500", bg: "bg-blue-50", border: "focus:border-blue-500" },
  cyan: { ring: "focus:ring-cyan-500/20", text: "text-cyan-500", bg: "bg-cyan-50", border: "focus:border-cyan-500" },
  sky: { ring: "focus:ring-sky-500/20", text: "text-sky-500", bg: "bg-sky-50", border: "focus:border-sky-500" },
  violet: { ring: "focus:ring-violet-500/20", text: "text-violet-500", bg: "bg-violet-50", border: "focus:border-violet-500" },
};

const qualityColor: Record<string, string> = {
  budget: "text-amber-700  bg-amber-50  border-amber-200",
  mid: "text-blue-700   bg-blue-50   border-blue-200",
  premium: "text-purple-700 bg-purple-50 border-purple-200",
};

export default function Home() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [category, setCategory] = useState("refrigerator");
  const [allAppliances, setAllAppliances] = useState<any[]>([]);
  const [appliances, setAppliances] = useState<any[]>([]);
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [budget, setBudget] = useState(150_000);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories once
  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(console.error);
    api.get("/appliances?limit=200").then(r => setAllAppliances(r.data)).catch(console.error);
  }, []);

  // When category or allAppliances changes, filter and set defaults
  useEffect(() => {
    const filtered = allAppliances.filter(a => a.category === category);
    setAppliances(filtered);
    setComparisonResult(null);
    setError("");
    if (filtered.length >= 2) {
      setModelA(filtered[0].id.toString());
      setModelB(filtered[1].id.toString());
    } else {
      setModelA("");
      setModelB("");
    }
  }, [category, allAppliances]);

  const handleCompare = async () => {
    if (!modelA || !modelB) return;
    if (modelA === modelB) { setError("Please select two different models."); return; }
    setLoading(true); setError(""); setComparisonResult(null);
    try {
      const res = await api.post("/compare", {
        model_a_id: parseInt(modelA),
        model_b_id: parseInt(modelB),
        budget_lkr: Number(budget),
      });
      setComparisonResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Comparison failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const meta = CATEGORY_META[category] || CATEGORY_META.refrigerator;
  const colors = COLOR_CLASSES[meta.color] || COLOR_CLASSES.blue;
  const Icon = meta.icon;

  const applianceInfo = (id: string) => appliances.find(a => a.id.toString() === id);

  return (
    <main className="min-h-screen bg-[#F0F4F8] text-slate-900 font-sans selection:bg-blue-200">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 pb-36 pt-14 px-6 shadow-indigo-900/30 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,_white,_transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F0F4F8] to-transparent" />
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-2 ring-1 ring-white/20">
            <Zap className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Appliance <span className="text-blue-200">EconoMetrics</span>
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
            True cost-of-ownership analysis for Sri Lankan appliances — covering refrigerators,
            washing machines, air conditioners &amp; TVs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {["IRR", "NPV", "BCR", "Payback Period", "Inflation", "Elec. Escalation", "Efficiency Decay", "Maintenance", "Operation Cost"].map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20 backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20 pb-24 space-y-8">

        {/* ── Category Selector ── */}
        <section className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl shadow-blue-900/10 ring-1 ring-slate-200/50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Appliance Category</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(categories.length > 0
              ? categories
              : Object.entries(CATEGORY_META).map(([v, m]) => ({ value: v, label: m.label }))
            ).map(cat => {
              const m2 = CATEGORY_META[cat.value];
              const CatIcon = m2?.icon ?? Zap;
              const active = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm
                    ${active
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"}`}
                >
                  <CatIcon className={`w-6 h-6 ${active ? "text-blue-500" : "text-slate-400"}`} />
                  {cat.label}
                  <span className="text-xs font-normal text-slate-400">
                    {allAppliances.filter(a => a.category === cat.value).length} models
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Model Selector Card ── */}
        <section className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-blue-900/10 ring-1 ring-slate-200/50 flex flex-col lg:flex-row gap-6 items-end">

          {/* Model A */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${colors.text}`} /> Model A
            </label>
            <div className="relative">
              <select
                value={modelA}
                onChange={e => setModelA(e.target.value)}
                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 ${colors.ring} ${colors.border} transition-all font-medium text-slate-800 appearance-none cursor-pointer`}
              >
                {appliances.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.brand} {a.model} — LKR {a.price_lkr.toLocaleString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {modelA && applianceInfo(modelA) && (() => {
              const a = applianceInfo(modelA)!;
              return (
                <div className={`flex flex-wrap gap-x-2 gap-y-1 text-xs px-3 py-1.5 rounded-xl border ${qualityColor[a.quality_tier] || qualityColor.mid} font-semibold`}>
                  <span>{a.lifespan_years}yr lifespan</span>·
                  <span>{a.energy_consumption_kwh_yr} kWh/yr</span>·
                  <span>Maint: LKR {a.maintenance_cost_yr.toLocaleString()}/yr</span>·
                  <span>Ops: LKR {(a.operation_cost_yr || 0).toLocaleString()}/yr</span>·
                  <span>Decay {(a.efficiency_decay_rate * 100).toFixed(1)}%/yr</span>
                </div>
              );
            })()}
          </div>

          <div className="hidden lg:flex pb-5 text-slate-300">
            <span className="text-2xl font-light italic">vs</span>
          </div>

          {/* Model B */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-emerald-500" /> Model B
            </label>
            <div className="relative">
              <select
                value={modelB}
                onChange={e => setModelB(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer"
              >
                {appliances.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.brand} {a.model} — LKR {a.price_lkr.toLocaleString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {modelB && applianceInfo(modelB) && (() => {
              const a = applianceInfo(modelB)!;
              return (
                <div className={`flex flex-wrap gap-x-2 gap-y-1 text-xs px-3 py-1.5 rounded-xl border ${qualityColor[a.quality_tier] || qualityColor.mid} font-semibold`}>
                  <span>{a.lifespan_years}yr lifespan</span>·
                  <span>{a.energy_consumption_kwh_yr} kWh/yr</span>·
                  <span>Maint: LKR {a.maintenance_cost_yr.toLocaleString()}/yr</span>·
                  <span>Ops: LKR {(a.operation_cost_yr || 0).toLocaleString()}/yr</span>·
                  <span>Decay {(a.efficiency_decay_rate * 100).toFixed(1)}%/yr</span>
                </div>
              );
            })()}
          </div>

          {/* Budget */}
          <div className="w-full lg:w-52 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <PiggyBank className="w-3.5 h-3.5 text-amber-400" /> Your Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">LKR</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-4 py-4 outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Analyse button */}
          <button
            onClick={handleCompare}
            disabled={loading || appliances.length < 2 || !modelA || !modelB}
            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-2xl px-10 py-4 transition-all duration-300 shrink-0 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 h-[60px]"
          >
            {loading ? (
              <span className="animate-pulse flex items-center gap-2"><TrendingUp className="w-5 h-5 animate-bounce" /> Analysing…</span>
            ) : (
              <><Calculator className="w-5 h-5" /> Analyse</>
            )}
          </button>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 text-red-600 flex items-center gap-3 p-5 rounded-2xl border border-red-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="bg-red-100 p-2 rounded-full"><AlertCircle className="w-5 h-5" /></span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* ── Results ── */}
        {comparisonResult && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">

            {/* TCO + Justification */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
              <div className="xl:col-span-3">
                <TCOChart
                  dataA={comparisonResult.comparison_result.model_a_tco}
                  dataB={comparisonResult.comparison_result.model_b_tco}
                  nameA={`${comparisonResult.model_a.brand} ${comparisonResult.model_a.model}`}
                  nameB={`${comparisonResult.model_b.brand} ${comparisonResult.model_b.model}`}
                />
              </div>
              <div className="xl:col-span-2">
                <JustificationPanel
                  winnerId={comparisonResult.comparison_result.winner_id}
                  justificationText={comparisonResult.comparison_result.justification}
                  modelA={comparisonResult.model_a}
                  modelB={comparisonResult.model_b}
                  budget={budget}
                  comparisonResult={comparisonResult.comparison_result}
                />
              </div>
            </div>

            {/* Full Economic Analysis */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Economic Analysis</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
              <EconomicIndicesPanel
                comparisonResult={comparisonResult.comparison_result}
                modelA={comparisonResult.model_a}
                modelB={comparisonResult.model_b}
              />
            </div>

            <p className="text-center text-xs text-slate-400 pb-4">
              Analysis based on Sri Lankan CEB electricity tariffs &amp; CBSL macroeconomic data (mocked). Discount rate: 10%. All figures in LKR.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
