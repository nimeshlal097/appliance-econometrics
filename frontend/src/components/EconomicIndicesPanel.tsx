"use client";

import React from "react";
import {
    TrendingUp, TrendingDown, Clock, Award, Zap, Wrench,
    Settings, Activity, DollarSign, BarChart3, ShieldCheck, AlertTriangle
} from "lucide-react";

interface EconomicIndicesPanelProps {
    comparisonResult: any;
    modelA: any;
    modelB: any;
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        green: "bg-emerald-100 text-emerald-700 border-emerald-200",
        amber: "bg-amber-100 text-amber-700 border-amber-200",
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        red: "bg-red-100 text-red-700 border-red-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorMap[color] || colorMap.blue}`}>
            {children}
        </span>
    );
}

function QualityBadge({ tier }: { tier: string }) {
    const tiers: Record<string, { color: string; label: string }> = {
        budget: { color: "amber", label: "Budget" },
        mid: { color: "blue", label: "Mid-Range" },
        premium: { color: "purple", label: "Premium" },
    };
    const t = tiers[tier] || tiers.mid;
    return <Badge color={t.color}>{t.label}</Badge>;
}

function MetricCard({
    icon: Icon, label, value, sub, color = "blue", highlight = false
}: {
    icon: any; label: string; value: string | React.ReactNode; sub?: string; color?: string; highlight?: boolean;
}) {
    const colorVariants: Record<string, string> = {
        blue: "text-blue-500 bg-blue-50",
        green: "text-emerald-500 bg-emerald-50",
        amber: "text-amber-500 bg-amber-50",
        red: "text-red-500 bg-red-50",
        purple: "text-purple-500 bg-purple-50",
        slate: "text-slate-500 bg-slate-50",
    };
    return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${highlight ? "border-emerald-300 bg-emerald-50/50" : "border-slate-100 bg-white"}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${colorVariants[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">{value}</div>
            {sub && <p className="text-xs text-slate-400 mt-1 leading-snug">{sub}</p>}
        </div>
    );
}

function CostRow({ label, valueA, valueB, winnerBetter }: {
    label: string; valueA: number; valueB: number; winnerBetter: "a" | "b" | "none";
}) {
    return (
        <div className="grid grid-cols-5 gap-2 items-center py-2 border-b border-slate-50 last:border-0">
            <span className="col-span-1 text-xs text-slate-500 font-medium">{label}</span>
            <span className={`col-span-2 text-sm font-semibold text-right ${winnerBetter === "a" ? "text-emerald-600" : "text-slate-700"}`}>
                {winnerBetter === "a" && <span className="mr-1 text-emerald-500">★</span>}
                LKR {valueA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className={`col-span-2 text-sm font-semibold text-right ${winnerBetter === "b" ? "text-emerald-600" : "text-slate-700"}`}>
                {winnerBetter === "b" && <span className="mr-1 text-emerald-500">★</span>}
                LKR {valueB.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
        </div>
    );
}

export default function EconomicIndicesPanel({ comparisonResult: cr, modelA, modelB }: EconomicIndicesPanelProps) {
    if (!cr || !modelA || !modelB) return null;

    const irr = cr.irr_percent;
    const bcr = cr.bcr;
    const payback = cr.payback_period_years;
    const npvA = cr.model_a_npv;
    const npvB = cr.model_b_npv;
    const years = cr.analysis_years;
    const inflation = cr.inflation_rate_percent;
    const elecRate = cr.electricity_rate_lkr_kwh;
    const elecEsc = cr.electricity_escalation_rate_percent;
    const decayA = cr.model_a_decay_rate_percent;
    const decayB = cr.model_b_decay_rate_percent;
    const lifespanA = cr.model_a_lifespan;
    const lifespanB = cr.model_b_lifespan;

    // First year cost breakdown for each model
    const yr1A = cr.model_a_breakdown?.[0];
    const yr1B = cr.model_b_breakdown?.[0];
    // Last year in analysis
    const lastYrA = cr.model_a_breakdown?.[years - 1];
    const lastYrB = cr.model_b_breakdown?.[years - 1];

    const npvWinIsA = npvA > npvB;

    return (
        <div className="space-y-6">
            {/* Economic Assumptions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-white/10 rounded-xl"><Activity className="w-5 h-5 text-blue-300" /></div>
                    <h4 className="text-lg font-bold text-white">Economic Assumptions</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Inflation</p>
                        <p className="text-xl font-extrabold text-white">{inflation}%</p>
                        <p className="text-xs text-slate-500 mt-0.5">CBSL annual rate</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Electricity Rate</p>
                        <p className="text-xl font-extrabold text-blue-300">LKR {elecRate}</p>
                        <p className="text-xs text-slate-500 mt-0.5">per kWh (CEB)</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Elec. Escalation</p>
                        <p className="text-xl font-extrabold text-amber-300">{elecEsc}%</p>
                        <p className="text-xs text-slate-500 mt-0.5">annual tariff increase</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Analysis Period</p>
                        <p className="text-xl font-extrabold text-emerald-300">{years} yrs</p>
                        <p className="text-xs text-slate-500 mt-0.5">shorter lifespan used</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Decay A</p>
                        <p className="text-xl font-extrabold text-red-300">{decayA?.toFixed(1)}%/yr</p>
                        <p className="text-xs text-slate-500 mt-0.5">efficiency loss</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Decay B</p>
                        <p className="text-xl font-extrabold text-red-300">{decayB?.toFixed(1)}%/yr</p>
                        <p className="text-xs text-slate-500 mt-0.5">efficiency loss</p>
                    </div>
                </div>
            </div>

            {/* Investment Metrics */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl ring-1 ring-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-blue-50 rounded-xl"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
                    <h4 className="text-lg font-bold text-slate-800">Investment Metrics</h4>
                    <span className="ml-auto text-xs text-slate-400">Premium vs. Budget model</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MetricCard
                        icon={TrendingUp}
                        label="IRR"
                        value={irr !== null && irr !== undefined ? `${irr}%` : "N/A"}
                        sub={irr !== null && irr !== undefined && irr > 10 ? "Exceeds 10% hurdle rate ✓" : "Below 10% hurdle rate"}
                        color={irr !== null && irr !== undefined && irr > 10 ? "green" : "amber"}
                        highlight={irr !== null && irr !== undefined && irr > 10}
                    />
                    <MetricCard
                        icon={Award}
                        label="Benefit-Cost Ratio"
                        value={bcr !== null ? (bcr === Infinity ? "∞" : bcr.toFixed(2)) : "N/A"}
                        sub={bcr >= 1 ? "BCR ≥ 1: investment pays off ✓" : "BCR < 1: premium may not pay off"}
                        color={bcr >= 1 ? "green" : "red"}
                        highlight={bcr >= 1}
                    />
                    <MetricCard
                        icon={Clock}
                        label="Payback Period"
                        value={payback !== null && payback !== undefined ? `${payback} yrs` : "Never"}
                        sub={payback !== null && payback !== undefined ? `Breaks even in ${payback} years` : "Does not recoup extra cost"}
                        color={payback !== null && payback !== undefined && payback < years ? "green" : "amber"}
                    />
                </div>
            </div>

            {/* Per-Model Cost Profiles */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl ring-1 ring-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-purple-50 rounded-xl"><DollarSign className="w-5 h-5 text-purple-500" /></div>
                    <h4 className="text-lg font-bold text-slate-800">Cost Profile Comparison</h4>
                </div>

                {/* Model Cards */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {[{ m: modelA, npv: npvA, decay: decayA, lifespan: lifespanA, yr1: yr1A, lastYr: lastYrA, label: "Model A", accentClass: "border-blue-200 bg-blue-50/30" },
                    { m: modelB, npv: npvB, decay: decayB, lifespan: lifespanB, yr1: yr1B, lastYr: lastYrB, label: "Model B", accentClass: "border-emerald-200 bg-emerald-50/30" }
                    ].map(({ m, npv, decay, lifespan, yr1, lastYr, label, accentClass }) => (
                        <div key={m.id} className={`rounded-2xl p-4 border ${accentClass}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
                                    <p className="text-base font-extrabold text-slate-800 leading-tight mt-0.5">{m.brand} {m.model}</p>
                                </div>
                                <QualityBadge tier={m.quality_tier || "mid"} />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Purchase Price</span>
                                    <span className="font-bold text-slate-800">LKR {m.price_lkr.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Lifespan</span>
                                    <span className="font-bold text-slate-700">{lifespan} years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" />Energy/yr</span>
                                    <span className="font-bold text-slate-700">{m.energy_consumption_kwh_yr} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 flex items-center gap-1"><Wrench className="w-3 h-3 text-blue-500" />Maint./yr</span>
                                    <span className="font-bold text-slate-700">LKR {m.maintenance_cost_yr.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 flex items-center gap-1"><Settings className="w-3 h-3 text-slate-400" />Operation/yr</span>
                                    <span className="font-bold text-slate-700">LKR {(m.operation_cost_yr || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Eff. Decay</span>
                                    <span className="font-bold text-red-500">{decay?.toFixed(1)}%/yr</span>
                                </div>
                                <div className="pt-2 border-t border-white/60">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-xs">Year 1 Op. Cost</span>
                                        <span className="font-bold text-slate-700">LKR {yr1?.total?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-slate-500 text-xs">Year {years} Op. Cost</span>
                                        <span className="font-bold text-red-500">LKR {lastYr?.total?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Year 1 breakdown table */}
                {yr1A && yr1B && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Year 1 Operating Cost Breakdown
                        </p>
                        <div className="grid grid-cols-5 gap-2 pb-1 border-b border-slate-200 mb-1">
                            <span className="col-span-1 text-xs text-slate-400 font-bold">Cost Type</span>
                            <span className="col-span-2 text-xs text-slate-500 font-bold text-right">{modelA.brand} {modelA.model.split(" ").slice(0, 2).join(" ")}</span>
                            <span className="col-span-2 text-xs text-slate-500 font-bold text-right">{modelB.brand} {modelB.model.split(" ").slice(0, 2).join(" ")}</span>
                        </div>
                        <CostRow label="Electricity" valueA={yr1A.electricity} valueB={yr1B.electricity} winnerBetter={yr1A.electricity <= yr1B.electricity ? "a" : "b"} />
                        <CostRow label="Maintenance" valueA={yr1A.maintenance} valueB={yr1B.maintenance} winnerBetter={yr1A.maintenance <= yr1B.maintenance ? "a" : "b"} />
                        <CostRow label="Operation" valueA={yr1A.operation} valueB={yr1B.operation} winnerBetter={yr1A.operation <= yr1B.operation ? "a" : "b"} />
                        <CostRow label="Total" valueA={yr1A.total} valueB={yr1B.total} winnerBetter={yr1A.total <= yr1B.total ? "a" : "b"} />
                    </div>
                )}
            </div>

            {/* NPV Comparison */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl ring-1 ring-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl"><TrendingDown className="w-5 h-5 text-indigo-500" /></div>
                    <h4 className="text-lg font-bold text-slate-800">Net Present Value (10% Discount)</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">Lower absolute NPV = less expensive in today's money over the analysis period. NPV is negative because these are costs.</p>
                <div className="space-y-3">
                    {[{ label: "Model A", m: modelA, npv: npvA, isWinner: npvWinIsA },
                    { label: "Model B", m: modelB, npv: npvB, isWinner: !npvWinIsA }
                    ].map(({ label, m, npv, isWinner }) => {
                        const maxNpv = Math.max(Math.abs(npvA), Math.abs(npvB));
                        const pct = Math.round((Math.abs(npv) / maxNpv) * 100);
                        return (
                            <div key={m.id} className={`p-4 rounded-2xl border transition-all ${isWinner ? "border-emerald-300 bg-emerald-50/40" : "border-slate-100"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {isWinner ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-slate-300" />}
                                        <span className="text-sm font-bold text-slate-600">{label}: {m.brand} {m.model}</span>
                                        {isWinner && <Badge color="green">Better Value</Badge>}
                                    </div>
                                    <span className="text-lg font-extrabold text-slate-800">
                                        LKR {Math.abs(npv).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ${isWinner ? "bg-emerald-400" : "bg-blue-300"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
