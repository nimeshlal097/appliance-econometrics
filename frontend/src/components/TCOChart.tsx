"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { LineChart } from 'lucide-react';

interface TCOChartProps {
    dataA: number[];
    dataB: number[];
    nameA: string;
    nameB: string;
}

export default function TCOChart({ dataA, dataB, nameA, nameB }: TCOChartProps) {
    const chartData = dataA.map((valA, idx) => ({
        year: `Year ${idx}`,
        [nameA]: valA,
        [nameB]: dataB[idx] || 0,
    }));

    return (
        <div className="h-[500px] w-full p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:shadow-2xl duration-500 flex flex-col pt-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110 duration-700"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10 px-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <LineChart className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Cost Projection</h3>
                    <p className="text-sm text-slate-500 font-medium">Cumulative TCO over 10 Years</p>
                </div>
            </div>

            <div className="flex-1 w-full relative z-10 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                        barGap={8}
                    >
                        <defs>
                            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={1} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.8} />
                            </linearGradient>
                            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={1} />
                                <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8FAFC', opacity: 0.5 }}
                            contentStyle={{
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                padding: '16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(8px)'
                            }}
                            itemStyle={{ fontWeight: 600, paddingBottom: '4px' }}
                            labelStyle={{ color: '#64748B', fontWeight: 500, marginBottom: '8px' }}
                            formatter={((value: number) => [`LKR ${value.toLocaleString()}`, '']) as any}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                        <Bar dataKey={nameA} fill="url(#colorA)" radius={[6, 6, 0, 0]} barSize={28} />
                        <Bar dataKey={nameB} fill="url(#colorB)" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
