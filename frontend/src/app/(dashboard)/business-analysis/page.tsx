'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  Package,
  DollarSign,
  Percent,
  Lightbulb,
  Loader,
  RefreshCw,
  Info,
  ChevronDown,
  Target,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  businessAnalysisAPI,
  type BusinessAnalysisCommodity,
  type BusinessAnalysisProduct,
  type SimulateResult,
  type BusinessRecommendation,
} from '@/lib/api';

const DEFAULT_ELASTICITY = -1.2;
const DEFAULT_VOLUME = 100;
const PRICE_CHANGE_RANGE = [-20, -15, -10, -5, 0, 5, 10, 15, 20];

export default function BusinessAnalysisPage() {
  const [commodities, setCommodities] = useState<BusinessAnalysisCommodity[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [products, setProducts] = useState<BusinessAnalysisProduct[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [recommendations, setRecommendations] = useState<BusinessRecommendation[]>([]);
  const [beforeSimulate, setBeforeSimulate] = useState<{ margin: number; profit: number; demand: number } | null>(null);
  const [clickedPoint, setClickedPoint] = useState<{
    priceChangePct: number;
    priceChangeLabel: string;
    newPrice: number;
    margin: number;
    profit: number;
    demand: number;
    revenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const selectableCommodities = useMemo(
    () => commodities.filter((c) => c.id !== 0 && c.price > 0),
    [commodities]
  );

  const selectedProduct = useMemo(() => {
    if (selectedId == null && products.length > 0) return products[0];
    return products.find((p) => p.commodity_id === selectedId) ?? products[0];
  }, [products, selectedId]);

  useEffect(() => {
    loadCommodities();
  }, []);

  useEffect(() => {
    if (selectableCommodities.length > 0 && selectedId === null) {
      setSelectedId(selectableCommodities[0].id);
    }
  }, [selectableCommodities, selectedId]);

  async function loadCommodities() {
    setLoading(true);
    try {
      const data = await businessAnalysisAPI.getCommodities();
      setCommodities(data.commodities ?? []);
      setDataSource(data.data_source ?? '');
      const list = (data.commodities ?? []).filter((c) => c.id !== 0 && c.price > 0);
      const initial: BusinessAnalysisProduct[] = list.map((c) => ({
        commodity_id: c.id,
        name: c.name,
        cost_per_unit: Math.round(c.price * 0.75 * 100) / 100,
        price_per_unit: c.price,
        volume: c.volume ?? DEFAULT_VOLUME,
        elasticity: DEFAULT_ELASTICITY,
      }));
      setProducts(initial);
      if (list.length > 0) setSelectedId(list[0].id);
      setResult(null);
      setRecommendations([]);
    } catch (e) {
      console.error(e);
      setCommodities([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function updateCurrentProduct(field: keyof BusinessAnalysisProduct, value: number | string) {
    if (!selectedProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.commodity_id === selectedProduct.commodity_id ? { ...p, [field]: value } : p
      )
    );
    setResult(null);
  }

  async function runSimulation() {
    if (!selectedProduct) return;
    setBeforeSimulate(
      result
        ? { margin: result.margin_percent, profit: result.profit, demand: selectedProduct.volume }
        : { margin: currentMarginPct, profit: currentProfit, demand: selectedProduct.volume }
    );
    setSimulating(true);
    try {
      const payload = [{
        commodity_id: selectedProduct.commodity_id,
        name: selectedProduct.name,
        cost_per_unit: selectedProduct.cost_per_unit,
        price_per_unit: selectedProduct.price_per_unit,
        volume: selectedProduct.volume,
        elasticity: selectedProduct.elasticity ?? DEFAULT_ELASTICITY,
      }];
      const data = await businessAnalysisAPI.simulate(payload);
      const res = (data.results ?? [])[0] ?? null;
      setResult(res);
      setRecommendations(data.recommendations ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  }

  const whatIfData = useMemo(() => {
    if (!selectedProduct) return [];
    const cost = selectedProduct.cost_per_unit;
    const basePrice = selectedProduct.price_per_unit;
    const baseVol = selectedProduct.volume;
    const elas = selectedProduct.elasticity ?? DEFAULT_ELASTICITY;
    return PRICE_CHANGE_RANGE.map((pct) => {
      const newPrice = basePrice * (1 + pct / 100);
      const volChange = elas * pct;
      const newVol = Math.max(0, baseVol * (1 + volChange / 100));
      const revenue = newPrice * newVol;
      const totalCost = cost * newVol;
      const profit = revenue - totalCost;
      const marginPct = newPrice > 0 ? ((newPrice - cost) / newPrice) * 100 : 0;
      return {
        priceChange: `${pct >= 0 ? '+' : ''}${pct}%`,
        priceChangePct: pct,
        newPrice,
        margin: Math.round(marginPct * 10) / 10,
        profit: Math.round(profit),
        revenue: Math.round(revenue),
        demand: Math.round(newVol),
      };
    });
  }, [selectedProduct]);

  const optimalPoint = useMemo(() => {
    if (whatIfData.length === 0) return null;
    let best = whatIfData[0];
    for (const d of whatIfData) {
      if (d.profit > best.profit) best = d;
    }
    const idx = whatIfData.indexOf(best);
    const pct = PRICE_CHANGE_RANGE[idx];
    const cost = selectedProduct?.cost_per_unit ?? 0;
    const basePrice = selectedProduct?.price_per_unit ?? 1;
    const optPrice = basePrice * (1 + (pct ?? 0) / 100);
    const optMargin = optPrice > 0 ? ((optPrice - cost) / optPrice) * 100 : 0;
    return { ...best, priceChangePct: pct, recommendedPrice: optPrice, recommendedMargin: optMargin };
  }, [whatIfData, selectedProduct]);

  const currentMarginPct = useMemo(() => {
    if (!selectedProduct) return 0;
    const p = selectedProduct.price_per_unit;
    const c = selectedProduct.cost_per_unit;
    return p > 0 ? ((p - c) / p) * 100 : 0;
  }, [selectedProduct]);

  const currentProfit = useMemo(() => {
    if (!selectedProduct) return 0;
    return (selectedProduct.price_per_unit - selectedProduct.cost_per_unit) * selectedProduct.volume;
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-blue-600" />
              Business Analysis
            </h1>
            <p className="text-gray-600 mt-1">
              Select a product, adjust inputs, and see how margin and profit vary — with visual what-if analysis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dataSource && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-1">
                <Info className="w-4 h-4" />
                {dataSource === 'your_uploaded_data' ? 'Your data' : 'Platform data'}
              </span>
            )}
            <button
              onClick={loadCommodities}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {selectableCommodities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No commodity data yet. Upload price data from the Upload data page to use Business Analysis.</p>
          </div>
        ) : (
          <>
            {/* Product selector dropdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select product to analyze</label>
              <div className="relative">
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => setSelectedId(Number(e.target.value))}
                  className="w-full max-w-md appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {selectableCommodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — ₹{c.price.toLocaleString('en-IN')}/unit
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: inputs + simulate */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Inputs for {selectedProduct.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cost per unit (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedProduct.cost_per_unit}
                          onChange={(e) => updateCurrentProduct('cost_per_unit', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Price per unit (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedProduct.price_per_unit}
                          onChange={(e) => updateCurrentProduct('price_per_unit', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Volume (units)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={selectedProduct.volume}
                          onChange={(e) => updateCurrentProduct('volume', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Price elasticity</label>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedProduct.elasticity ?? DEFAULT_ELASTICITY}
                          onChange={(e) => updateCurrentProduct('elasticity', parseFloat(e.target.value) || DEFAULT_ELASTICITY)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">e.g. -1.2 = demand drops 1.2% per 1% price rise</p>
                      </div>
                    </div>
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                      {simulating ? <Loader className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                      Simulate & get recommendations
                    </button>
                  </div>

                  {/* What-if: how margin & profit vary with price change */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How margin & profit vary with price</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Click a point to see interpretation: before/after units sold and impact of that price change.
                    </p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={whatIfData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="priceChange" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value: number, name: string) =>
                              name === 'margin' ? `${value}%` : name === 'demand' ? `${value} units` : `₹ ${value.toLocaleString('en-IN')}`
                            }
                            labelFormatter={(l) => `Price change: ${l}`}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="margin"
                            name="Margin %"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={(props: { cx?: number; cy?: number; payload?: (typeof whatIfData)[0] }) => {
                              const { cx = 0, cy = 0, payload: p } = props;
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={6}
                                  fill="#2563eb"
                                  stroke="#fff"
                                  strokeWidth={2}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() =>
                                    p &&
                                    setClickedPoint({
                                      priceChangePct: p.priceChangePct,
                                      priceChangeLabel: p.priceChange,
                                      newPrice: p.newPrice,
                                      margin: p.margin,
                                      profit: p.profit,
                                      demand: p.demand,
                                      revenue: p.revenue,
                                    })
                                  }
                                />
                              );
                            }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="profit"
                            name="Profit (₹)"
                            stroke="#059669"
                            strokeWidth={2}
                            dot={(props: { cx?: number; cy?: number; payload?: (typeof whatIfData)[0] }) => {
                              const { cx = 0, cy = 0, payload: p } = props;
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={6}
                                  fill="#059669"
                                  stroke="#fff"
                                  strokeWidth={2}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() =>
                                    p &&
                                    setClickedPoint({
                                      priceChangePct: p.priceChangePct,
                                      priceChangeLabel: p.priceChange,
                                      newPrice: p.newPrice,
                                      margin: p.margin,
                                      profit: p.profit,
                                      demand: p.demand,
                                      revenue: p.revenue,
                                    })
                                  }
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {clickedPoint && selectedProduct && (
                      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <h4 className="text-sm font-semibold text-indigo-900 mb-2">Interpretation at {clickedPoint.priceChangeLabel} price change</h4>
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>Before (current):</strong> At ₹{selectedProduct.price_per_unit.toFixed(2)}/unit you were selling{' '}
                          <strong>{selectedProduct.volume} units</strong>. Revenue ₹
                          {(selectedProduct.price_per_unit * selectedProduct.volume).toLocaleString('en-IN')}, profit ₹
                          {(currentProfit).toLocaleString('en-IN')}.
                        </p>
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>After this price change:</strong> Price becomes <strong>₹{clickedPoint.newPrice.toFixed(2)}</strong>/unit. Due to demand
                          response (elasticity {(selectedProduct.elasticity ?? DEFAULT_ELASTICITY)}), volume sold changes to{' '}
                          <strong>{clickedPoint.demand} units</strong> (was {selectedProduct.volume} units).
                        </p>
                        <p className="text-sm text-gray-800">
                          So <strong>{clickedPoint.demand} units</strong> are now sold at the new price. Revenue = ₹
                          {clickedPoint.revenue.toLocaleString('en-IN')}, profit = ₹{clickedPoint.profit.toLocaleString('en-IN')}, margin ={' '}
                          <strong>{clickedPoint.margin}%</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: visual KPIs + recommendations — only update when you press Simulate */}
                <div className="space-y-6">
                  {/* Margin gauge: shows simulated margin after Simulate, else current */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      {result ? 'Margin (from simulation)' : 'Margin (press Simulate to update)'}
                    </h3>
                    <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, result ? result.margin_percent : currentMarginPct))}%`,
                          backgroundColor:
                            (result ? result.margin_percent : currentMarginPct) >= 20
                              ? '#059669'
                              : (result ? result.margin_percent : currentMarginPct) >= 10
                                ? '#d97706'
                                : '#dc2626',
                        }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(result ? result.margin_percent : currentMarginPct).toFixed(1)}%
                    </p>
                  </div>

                  {/* Profit card: shows simulated profit after Simulate, else current */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {result ? 'Profit (from simulation)' : 'Profit (press Simulate to update)'}
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        (result ? result.profit : currentProfit) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ₹ {(result ? result.profit : currentProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result
                        ? `Revenue ₹${result.revenue?.toLocaleString('en-IN') ?? '—'} − Cost ₹${result.total_cost?.toLocaleString('en-IN') ?? '—'}`
                        : `Revenue ₹${(selectedProduct.price_per_unit * selectedProduct.volume).toLocaleString('en-IN')} − Cost ₹${(selectedProduct.cost_per_unit * selectedProduct.volume).toLocaleString('en-IN')}`}
                    </p>
                  </div>

                  {result && beforeSimulate && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Change after simulation</h3>
                      <p className="text-xs text-gray-500">Before (at Simulate) → After (result).</p>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Profit margin</span>
                          <span className="font-medium">
                            <span className="text-gray-500" title="Before">{(Math.round(beforeSimulate.margin * 10) / 10).toFixed(1)}%</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-700" title="After">{(Math.round(result.margin_percent * 10) / 10).toFixed(1)}%</span>
                            <span className="ml-1 text-gray-500">
                              ({result.margin_percent - beforeSimulate.margin >= 0 ? '+' : ''}{(result.margin_percent - beforeSimulate.margin).toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Profit</span>
                          <span className="font-medium">
                            <span className="text-gray-500" title="Before">₹{Math.round(beforeSimulate.profit).toLocaleString('en-IN')}</span>
                            <span className="mx-1">→</span>
                            <span className={result.profit >= beforeSimulate.profit ? 'text-green-700' : 'text-red-600'} title="After">
                              ₹{Math.round(result.profit).toLocaleString('en-IN')}
                            </span>
                            <span className="ml-1 text-gray-500">
                              ({result.profit - beforeSimulate.profit >= 0 ? '+' : ''}₹{Math.round(result.profit - beforeSimulate.profit).toLocaleString('en-IN')})
                            </span>
                          </span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-medium text-blue-800 mb-1">How demand is acting</p>
                          <p className="text-gray-700 text-sm">
                            At your current price, demand = <strong>{beforeSimulate.demand} units</strong>. With elasticity {(selectedProduct?.elasticity ?? DEFAULT_ELASTICITY)},
                            for every <strong>1% price increase</strong>, demand moves by ~{(selectedProduct?.elasticity ?? DEFAULT_ELASTICITY)}%. So if you raise price 5%, expected demand ≈{' '}
                            <strong>{Math.round(beforeSimulate.demand * (1 + ((selectedProduct?.elasticity ?? DEFAULT_ELASTICITY) * 5) / 100))} units</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {optimalPoint && selectedProduct && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Recommended profit margin
                      </h3>
                      <p className="text-sm text-amber-800 mb-2">
                        Based on your cost, elasticity, and current volume, the best profit in this range is at{' '}
                        <strong>{optimalPoint.priceChangePct >= 0 ? '+' : ''}{optimalPoint.priceChangePct}%</strong> price change.
                      </p>
                      <ul className="text-sm space-y-1 text-gray-800">
                        <li>→ Target margin: <strong>{optimalPoint.recommendedMargin.toFixed(1)}%</strong></li>
                        <li>→ Suggested price: <strong>₹{optimalPoint.recommendedPrice.toFixed(2)}</strong>/unit</li>
                        <li>→ Expected demand at that price: <strong>{optimalPoint.demand} units</strong></li>
                        <li>→ Max profit (in range): <strong>₹{optimalPoint.profit.toLocaleString('en-IN')}</strong></li>
                      </ul>
                      <p className="text-xs text-amber-700 mt-2">
                        This is the correct profit margin to aim for under current elasticity; adjust price toward ₹{optimalPoint.recommendedPrice.toFixed(2)} to move toward it.
                      </p>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        How to increase business
                      </h3>
                      <ul className="space-y-3">
                        {recommendations
                          .filter((r) => r.commodity === selectedProduct?.name || !r.commodity || r.type === 'pair_commodities' || r.type === 'volume_focus')
                          .slice(0, 5)
                          .map((rec, idx) => (
                            <li
                              key={idx}
                              className={`text-sm p-3 rounded-lg border-l-4 ${
                                rec.type === 'price_increase' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'
                              }`}
                            >
                              <p className="font-medium text-gray-900">{rec.title}</p>
                              <p className="text-gray-700 mt-0.5" dangerouslySetInnerHTML={{ __html: rec.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              <p className="text-xs text-gray-600 mt-1">→ {rec.action}</p>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
