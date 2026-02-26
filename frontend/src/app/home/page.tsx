'use client';

import Link from 'next/link';
import { 
  Activity, TrendingUp, Brain, Shield, BarChart3, ArrowRight, Sparkles, 
  Zap, AlertTriangle, Database, LineChart, Target, Upload, 
  MessageSquare, Bell, Store, Users, Factory, CheckCircle
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-blue-700">AI Market Pulse</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#problem" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Problem
              </Link>
              <Link href="#workflow" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                AI Workflow
              </Link>
              <Link href="#features" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Features
              </Link>
              <Link href="#impact" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Impact
              </Link>
              <Link
                href="/login"
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Explore Prototype
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI Research Prototype • Hackathon Innovation
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Driven Market Intelligence
              <br />
              <span className="text-blue-700">for Smarter Decision Making</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Advanced AI prototype leveraging machine learning for real-time price forecasting, sentiment analytics, and price sensitivity modeling to empower businesses with data-driven market intelligence.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition"
              >
                Explore Prototype
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition border-2 border-gray-300"
              >
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-gray-900">85%+</div>
                <div className="text-sm text-gray-500 mt-1">Forecast Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">Real-time</div>
                <div className="text-sm text-gray-500 mt-1">Sentiment Analysis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">AI-Powered</div>
                <div className="text-sm text-gray-500 mt-1">Price Intelligence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Problem We&apos;re Solving
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional market intelligence tools are outdated, reactive, and lack predictive capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Price Volatility</h3>
              <p className="text-gray-600 mb-4">
                Businesses struggle to predict market price fluctuations, leading to poor inventory and pricing decisions.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Lost Revenue & Margins
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Limited Insights</h3>
              <p className="text-gray-600 mb-4">
                Current tools provide historical data but lack AI-driven forecasting and sentiment analysis.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Reactive Decision Making
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complex Data</h3>
              <p className="text-gray-600 mb-4">
                Market data is fragmented across sources, making it difficult to get actionable intelligence.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Analysis Paralysis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section id="workflow" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our AI Workflow
            </h2>
            <p className="text-lg text-gray-600">
              End-to-end machine learning pipeline for intelligent market analysis
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                  1
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Data Ingestion</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Upload historical data like CSV, XLSX, or JSON formats
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                  2
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">AI Processing</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Machine learning models analyze patterns, trends, and correlations
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                  3
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Predictive Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Generate price forecasts with confidence intervals and risk assessment
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            {/* Step 4 */}
            <div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                  4
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Actionable Insights</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Deliver recommendations through interactive dashboards and AI copilot
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive AI-powered tools for market intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Price Forecasting</h3>
              <p className="text-gray-600">
                Machine learning models predict future prices with 85%+ accuracy using historical patterns and market signals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sentiment Intelligence</h3>
              <p className="text-gray-600">
                Real-time sentiment analysis from news, social media, and market data to gauge market psychology.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Price Sensitivity Modeling</h3>
              <p className="text-gray-600">
                Understand demand-supply and optimize pricing strategies with AI-powered sensitivity analysis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Market Copilot</h3>
              <p className="text-gray-600">
                Conversational AI assistant for market insights, expert guidance, and data-driven recommendations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Risk Monitoring</h3>
              <p className="text-gray-600">
                Proactive alerts for supply shocks, demand surges, and market anomalies to mitigate risks.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Lightning-fast data processing with live updates, dashboards, and visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Applications Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-blue-700 to-teal-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Impact & Applications
            </h2>
            <p className="text-lg text-blue-100">
              Empowering diverse stakeholders with AI-driven market intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Application 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Retailers</h3>
              <p className="text-blue-100 mb-4">
                Optimize inventory management and pricing strategies with accurate demand forecasting.
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Reduce stockouts by 40%
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Improve margins by 15%
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Dynamic pricing optimization
                </li>
              </ul>
            </div>

            {/* Application 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Traders & Investors</h3>
              <p className="text-blue-100 mb-4">
                Make informed trading decisions with real-time market analysis and price simulations.
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Higher trading accuracy
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Risk-adjusted returns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Market timing insights
                </li>
              </ul>
            </div>

            {/* Application 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">MSMEs & Manufacturers</h3>
              <p className="text-blue-100 mb-4">
                Plan production and manage costs with commodity price intelligence and trend forecasting.
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Reduce procurement costs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Optimize production cycles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Better budget volatility
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Experience AI Market Intelligence?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Explore our prototype and see how AI can transform market analysis
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-800 transition text-lg"
          >
            Explore Prototype
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">AI Market Pulse</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/features" className="hover:text-white">Features</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 AI Market Pulse. Hackathon Prototype.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
