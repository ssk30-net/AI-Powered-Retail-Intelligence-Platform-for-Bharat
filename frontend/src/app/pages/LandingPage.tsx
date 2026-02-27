'use client';

import { ArrowRight, Sparkles, TrendingUp, Brain, Shield, Zap, Users, Building2, Factory, BarChart3, Lock, Cloud, CheckCircle2, Star, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { LogoConcept1 } from '../components/logos/LogoConcept1';
import { LogoConcept2 } from '../components/logos/LogoConcept2';
import { LogoConcept3 } from '../components/logos/LogoConcept3';
import { useRouter } from 'next/navigation';

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoConcept2 variant="full" size={40} />
            <div className="flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Features
              </a>
              <a href="#product" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Product
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Pricing
              </a>
              <button
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#1F3C88]/5 via-white to-[#00A8A8]/5 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#1F3C88]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00A8A8]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7A00]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1F3C88]/20 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span className="text-sm font-medium text-gray-700">Powered by Advanced AI & Machine Learning</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] bg-clip-text text-transparent">
                AI-Driven Market Intelligence
              </span>
              <br />
              for Smarter Commerce Decisions
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Transform your business with real-time price forecasting, market sentiment insights, 
              and AI-powered pricing intelligence. Make data-driven decisions with confidence.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/app')}
                className="px-8 py-4 bg-white border-2 border-[#1F3C88] text-[#1F3C88] rounded-lg font-semibold text-lg hover:bg-[#1F3C88] hover:text-white transition-all"
              >
                View Live Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00A8A8]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00A8A8]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00A8A8]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-12 opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Enterprise Clients</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime SLA</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">2B+</div>
              <div className="text-sm text-gray-600">Data Points Analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Concepts Showcase */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Brand Identity Concepts</h2>
            <p className="text-xl text-gray-600">Professional logo variations for AI Market Pulse</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Concept 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Concept 1: Data Graph Fusion</h3>
                <p className="text-sm text-gray-600">Minimal AI + market data visualization</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <LogoConcept1 variant="full" size={48} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept1 variant="icon" size={64} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept1 variant="monochrome" size={40} />
                </div>
              </div>
            </div>

            {/* Concept 2 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#1F3C88] hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-[#FF7A00] text-white text-xs font-semibold rounded-full">
                SELECTED
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Concept 2: Pulse + Arrow</h3>
                <p className="text-sm text-gray-600">Market pulse with upward trend</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <LogoConcept2 variant="full" size={48} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept2 variant="icon" size={64} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept2 variant="monochrome" size={40} />
                </div>
              </div>
            </div>

            {/* Concept 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Concept 3: Neural Network</h3>
                <p className="text-sm text-gray-600">AI network forming chart pattern</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <LogoConcept3 variant="full" size={48} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept3 variant="icon" size={64} />
                </div>
                <div className="flex justify-center">
                  <LogoConcept3 variant="monochrome" size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Brand Color Palette</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-xl bg-[#1F3C88] mb-3 shadow-lg"></div>
                <div className="font-mono text-sm font-semibold">#1F3C88</div>
                <div className="text-xs text-gray-600">Deep Blue</div>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-xl bg-[#00A8A8] mb-3 shadow-lg"></div>
                <div className="font-mono text-sm font-semibold">#00A8A8</div>
                <div className="text-xs text-gray-600">Teal</div>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-xl bg-[#FF7A00] mb-3 shadow-lg"></div>
                <div className="font-mono text-sm font-semibold">#FF7A00</div>
                <div className="text-xs text-gray-600">Accent Orange</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Features for Modern Commerce</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade AI tools designed to transform your market intelligence workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'AI Price Forecasting',
                description: 'Predict market prices with 85%+ accuracy using advanced machine learning models trained on billions of data points.',
                color: 'from-[#1F3C88] to-[#00A8A8]',
              },
              {
                icon: Brain,
                title: 'Market Sentiment Intelligence',
                description: 'Real-time sentiment analysis from news, social media, and market signals to understand market psychology.',
                color: 'from-[#00A8A8] to-[#1F3C88]',
              },
              {
                icon: BarChart3,
                title: 'Price Sensitivity Analytics',
                description: 'Understand demand elasticity and optimize pricing strategies with AI-powered sensitivity analysis.',
                color: 'from-[#1F3C88] to-[#FF7A00]',
              },
              {
                icon: Sparkles,
                title: 'AI Market Copilot',
                description: 'Chat with your data. Get instant insights, generate reports, and make decisions with AI assistance.',
                color: 'from-[#FF7A00] to-[#00A8A8]',
              },
              {
                icon: Shield,
                title: 'Risk Alerts Dashboard',
                description: 'Proactive risk monitoring with real-time alerts for volatility, demand surges, and market anomalies.',
                color: 'from-[#00A8A8] to-[#1F3C88]',
              },
              {
                icon: Zap,
                title: 'Real-Time Data Sync',
                description: 'Lightning-fast data processing with sub-second latency. Stay ahead of market movements.',
                color: 'from-[#1F3C88] to-[#00A8A8]',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#1F3C88] hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="product" className="py-20 px-6 bg-gradient-to-br from-[#1F3C88]/5 to-[#00A8A8]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">See AI Market Pulse in Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional dashboards and AI-powered analytics at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dashboard Preview */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Intelligence Dashboard</h3>
              <div className="bg-gradient-to-br from-[#1F3C88]/10 to-[#00A8A8]/10 rounded-xl h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Interactive Dashboard Preview</p>
                  <button
                    onClick={() => router.push('/app')}
                    className="mt-4 px-6 py-2 bg-[#1F3C88] text-white rounded-lg font-semibold hover:bg-[#00A8A8] transition-colors"
                  >
                    View Live Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Forecast Chart Preview */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Price Forecast</h3>
              <div className="bg-gradient-to-br from-[#FF7A00]/10 to-[#1F3C88]/10 rounded-xl h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Prediction Model Visualization</p>
                  <button
                    onClick={() => router.push('/app/forecast')}
                    className="mt-4 px-6 py-2 bg-[#1F3C88] text-white rounded-lg font-semibold hover:bg-[#00A8A8] transition-colors"
                  >
                    Explore Forecasts
                  </button>
                </div>
              </div>
            </div>

            {/* AI Copilot Preview - Full Width */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Market Copilot Interface</h3>
              <div className="bg-gradient-to-br from-[#00A8A8]/10 to-[#1F3C88]/10 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Conversational AI Assistant</p>
                  <button
                    onClick={() => router.push('/app/copilot')}
                    className="mt-4 px-6 py-2 bg-[#1F3C88] text-white rounded-lg font-semibold hover:bg-[#00A8A8] transition-colors"
                  >
                    Chat with AI Copilot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Built for Industry Leaders</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by retailers, traders, manufacturers, and analysts worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Building2,
                title: 'Retailers',
                description: 'Optimize inventory and pricing strategies with AI-powered demand forecasting.',
                stat: '35% Revenue Increase',
              },
              {
                icon: TrendingUp,
                title: 'Traders',
                description: 'Make informed decisions with real-time market sentiment and price predictions.',
                stat: '92% Accuracy Rate',
              },
              {
                icon: Factory,
                title: 'Manufacturers',
                description: 'Plan production and manage costs with commodity price intelligence.',
                stat: '40% Cost Reduction',
              },
              {
                icon: Users,
                title: 'Market Analysts',
                description: 'Generate comprehensive reports and insights with AI-powered analytics.',
                stat: '10x Faster Analysis',
              },
            ].map((useCase, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] flex items-center justify-center mb-6">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{useCase.description}</p>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-[#FF7A00] font-semibold">{useCase.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Security & Compliance</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Your data security and privacy are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                description: 'Military-grade AES-256 encryption for all data in transit and at rest.',
              },
              {
                icon: Cloud,
                title: 'Cloud Infrastructure',
                description: 'Hosted on AWS with 99.9% uptime SLA and automatic failover protection.',
              },
              {
                icon: Shield,
                title: 'SOC 2 Type II Certified',
                description: 'Independently audited for security, availability, and confidentiality.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <item.icon className="w-12 h-12 text-[#FF7A00] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-white/80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-2 text-white/60" />
              <div className="text-sm text-white/80">GDPR Compliant</div>
            </div>
            <div className="text-center">
              <Lock className="w-16 h-16 mx-auto mb-2 text-white/60" />
              <div className="text-sm text-white/80">ISO 27001</div>
            </div>
            <div className="text-center">
              <Cloud className="w-16 h-16 mx-auto mb-2 text-white/60" />
              <div className="text-sm text-white/80">AWS Infrastructure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business needs. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#1F3C88] hover:shadow-xl transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600">For small teams getting started</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">$299</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Up to 5 users',
                  '100K data points/month',
                  'Basic AI forecasting',
                  'Email support',
                  'Dashboard access',
                  'API access',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00A8A8] flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] rounded-2xl p-8 text-white relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#FF7A00] text-white text-sm font-semibold rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-white/90">For growing businesses</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">$999</div>
                <div className="text-white/90">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Up to 25 users',
                  '1M data points/month',
                  'Advanced AI forecasting',
                  'Priority support',
                  'AI Copilot access',
                  'Custom integrations',
                  'Risk alerts',
                  'White-label reports',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FF7A00] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-white text-[#1F3C88] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#1F3C88] hover:shadow-xl transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">For large organizations</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">contact sales</div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited users',
                  'Unlimited data points',
                  'Custom AI models',
                  'Dedicated support',
                  'On-premise deployment',
                  'SLA guarantee',
                  'Advanced security',
                  'Custom training',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00A8A8] flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <LogoConcept2 variant="monochrome" size={40} />
              <p className="text-gray-400 mt-4 leading-relaxed">
                AI-powered market intelligence platform for smarter commerce decisions.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © 2026 AI Market Pulse. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@aimarketpulse.com" className="hover:text-white transition-colors">
                  hello@aimarketpulse.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
