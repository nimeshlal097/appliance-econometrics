"use client";

import React from "react";
import {
    ShieldCheck, AlertTriangle, TrendingDown, BatteryCharging,
    Info, Zap, Clock
} from "lucide-react";

interface JustificationPanelProps {
    winnerId: number;
    justificationText: string;
    modelA: any;
    modelB: any;
    budget: number;
    comparisonResult?: any;
}

export default function JustificationPanel({
    winnerId,
    justificationText,
    modelA,
    modelB,
    budget,
    comparisonResult: cr,
}: JustificationPanelProps) {
    if (!modelA || !modelB) return null;

    const winner = modelA.id === winnerId ? modelA : modelB;
    const isOverBudget = winner.price_lkr > budget;
    const npvSavings = cr?.npv_savings;
    const analysisYears = cr?.analysis_years;

    return (
        <div className={`relative overflow-hidden p-8 rounded-[2rem] shadow-xl transition-all duration-500 hover:shadow-2xl border ${isOverBudget ? "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/60" : "bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200/60"} w-full group`}>
            {/* Decorative blob */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transition-transform duration-700 group-hover:scale-110 ${isOverBudget ? "bg-amber-100" : "bg-emerald-100"}`} />

            {/* Header */}
            <div className="flex items-start gap-4 mb-5 relative z-10">
                <div className={`p-3 rounded-2xl shadow-sm ${isOverBudget ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {isOverBudget ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
                <div>
                    <h3 className={`text-2xl font-extrabold tracking-tight ${isOverBudget ? "text-amber-900" : "text-emerald-900"}`}>
                        Recommendation
                    </h3>
                    <p className={`text-sm font-medium ${isOverBudget ? "text-amber-700/80" : "text-emerald-700/80"}`}>
                        Data-backed purchasing advice
                    </p>
                </div>
            </div>

            {/* Justification text */}
            <div className="relative z-10 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-slate-200 to-transparent" />
                <p className="text-slate-700 text-base leading-relaxed pl-6 font-medium">
                    {justificationText}
                </p>
            </div>

            {/* Quick stat row */}
            {npvSavings !== undefined && npvSavings !== null && (
                <div className="grid grid-cols-3 gap-3 relative z-10 mb-4">
                    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">NPV Savings</p>
                        <p className="text-base font-extrabold text-emerald-700">LKR {Math.abs(npvSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">IRR</p>
                        <p className="text-base font-extrabold text-blue-700">{cr?.irr_percent != null ? `${cr.irr_percent}%` : "N/A"}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Payback</p>
                        <p className="text-base font-extrabold text-slate-700">{cr?.payback_period_years != null ? `${cr.payback_period_years} yr` : "N/A"}</p>
                    </div>
                </div>
            )}

            {/* Winner card + savings note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <BatteryCharging className="w-4 h-4 text-blue-500" /> Optimal Choice
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mb-1">{winner.brand} {winner.model}</div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-sm font-semibold text-slate-600">
                        LKR {winner.price_lkr.toLocaleString()}
                    </div>
                    {winner.lifespan_years && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" /> {winner.lifespan_years}-year lifespan
                        </div>
                    )}
                    {winner.energy_consumption_kwh_yr && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Zap className="w-3 h-3 text-yellow-500" /> {winner.energy_consumption_kwh_yr} kWh/year
                        </div>
                    )}
                </div>

                <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-wide mb-2 uppercase text-sm">
                        <TrendingDown className="w-5 h-5" /> Long-term Advantage
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-snug flex items-start gap-2">
                        <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        {analysisYears
                            ? `Over ${analysisYears} years, factoring in electricity escalation, efficiency decay, maintenance & operation costs, this model offers the lowest total cost of ownership.`
                            : "This model offers a structurally superior Net Present Value over its lifespan."}
                    </p>
                </div>
            </div>
        </div>
    );
}
