import { ArrowRight, Sparkles, TrendingUp, Brain, Shield, BarChart3, Users, Building2, Factory, Target, Zap, Activity } from 'lucide-react';
import { LogoConcept2 } from '../components/logos/LogoConcept2';
import { useNavigate } from 'react-router';

export function PrototypeLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoConcept2 variant="full" size={40} />
            <div className="flex items-center gap-8">
              <a href="#problem" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Problem
              </a>
              <a href="#workflow" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                AI Workflow
              </a>
              <a href="#features" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Features
              </a>
              <a href="#impact" className="text-gray-700 hover:text-[#1F3C88] font-medium transition-colors">
                Impact
              </a>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Explore Prototype
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#1F3C88]/5 via-white to-[#00A8A8]/5 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#1F3C88]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00A8A8]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7A00]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1F3C88]/20 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span className="text-sm font-medium text-gray-700">AI Research Prototype • Hackathon Innovation</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] bg-clip-text text-transparent">
                AI-Driven Market Intelligence
              </span>
              <br />
              for Smarter Decision Making
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Advanced AI prototype leveraging machine learning for real-time price forecasting, 
              sentiment analytics, and price sensitivity modeling to empower businesses with 
              data-driven market intelligence.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                Explore Prototype
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="px-8 py-4 bg-white border-2 border-[#1F3C88] text-[#1F3C88] rounded-lg font-semibold text-lg hover:bg-[#1F3C88] hover:text-white transition-all"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Innovation badges */}
          <div className="flex items-center justify-center gap-12 opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">85%+</div>
              <div className="text-sm text-gray-600">Forecast Accuracy</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">Real-time</div>
              <div className="text-sm text-gray-600">Sentiment Analysis</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">AI-Powered</div>
              <div className="text-sm text-gray-600">Price Intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">The Problem We're Solving</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional market intelligence tools are outdated, reactive, and lack predictive capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Price Volatility',
                description: 'Businesses struggle to predict market price fluctuations, leading to poor inventory and pricing decisions.',
                impact: 'Lost Revenue & Margins',
              },
              {
                icon: Brain,
                title: 'Limited Insights',
                description: 'Current tools provide historical data but lack AI-driven forecasting and sentiment analysis.',
                impact: 'Reactive Decision Making',
              },
              {
                icon: Target,
                title: 'Complex Data',
                description: 'Market data is fragmented across sources, making it difficult to get actionable intelligence.',
                impact: 'Analysis Paralysis',
              },
            ].map((problem, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6">
                  <problem.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{problem.description}</p>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-red-600 font-semibold text-sm">⚠️ {problem.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section id="workflow" className="py-20 px-6 bg-gradient-to-br from-[#1F3C88]/5 to-[#00A8A8]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our AI Workflow</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end machine learning pipeline for intelligent market analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Data Ingestion',
                description: 'Upload historical market data via CSV, XLSX, or JSON formats',
                icon: Activity,
              },
              {
                step: '2',
                title: 'AI Processing',
                description: 'Machine learning models analyze patterns, trends, and correlations',
                icon: Brain,
              },
              {
                step: '3',
                title: 'Predictive Analytics',
                description: 'Generate price forecasts with confidence intervals and risk assessment',
                icon: TrendingUp,
              },
              {
                step: '4',
                title: 'Actionable Insights',
                description: 'Deliver recommendations through interactive dashboards and AI copilot',
                icon: Sparkles,
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-[#00A8A8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#00A8A8]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI-powered tools for market intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'AI Price Forecasting',
                description: 'Machine learning models predict future prices with 85%+ accuracy using historical patterns and market signals.',
              },
              {
                icon: Brain,
                title: 'Sentiment Intelligence',
                description: 'Real-time sentiment analysis from news, social media, and market data to gauge market psychology.',
              },
              {
                icon: BarChart3,
                title: 'Price Sensitivity Modeling',
                description: 'Understand demand elasticity and optimize pricing strategies with AI-powered sensitivity analysis.',
              },
              {
                icon: Sparkles,
                title: 'AI Market Copilot',
                description: 'Conversational AI assistant for instant insights, report generation, and data-driven recommendations.',
              },
              {
                icon: Shield,
                title: 'Risk Monitoring',
                description: 'Proactive alerts for volatility spikes, demand surges, and market anomalies to mitigate risks.',
              },
              {
                icon: Zap,
                title: 'Real-Time Analytics',
                description: 'Lightning-fast data processing with interactive dashboards and visualizations.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1F3C88] hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-6 bg-gradient-to-br from-[#1F3C88] to-[#00A8A8] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Impact & Applications</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Empowering diverse stakeholders with AI-driven market intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: 'Retailers',
                description: 'Optimize inventory management and pricing strategies with accurate demand forecasting.',
                benefits: ['Reduce stockouts by 40%', 'Improve margins by 15%', 'Dynamic pricing optimization'],
              },
              {
                icon: TrendingUp,
                title: 'Traders & Investors',
                description: 'Make informed trading decisions with real-time sentiment analysis and price predictions.',
                benefits: ['Higher trading accuracy', 'Risk-adjusted returns', 'Market timing insights'],
              },
              {
                icon: Factory,
                title: 'MSMEs & Manufacturers',
                description: 'Plan production and manage costs with commodity price intelligence and trend forecasting.',
                benefits: ['Reduce procurement costs', 'Optimize production cycles', 'Hedge against volatility'],
              },
            ].map((impact, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-[#FF7A00] flex items-center justify-center mb-6">
                  <impact.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{impact.title}</h3>
                <p className="text-white/80 mb-6 leading-relaxed">{impact.description}</p>
                <div className="space-y-2">
                  {impact.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></div>
                      <span className="text-sm text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Ready to Experience AI Market Intelligence?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore our prototype and see how AI can transform market analysis
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2 group"
          >
            Explore Prototype
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <LogoConcept2 variant="monochrome" size={40} />
              <p className="text-gray-400 mt-3 text-sm">
                AI-powered market intelligence prototype for hackathon innovation.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© 2026 AI Market Pulse Research Prototype</p>
              <p className="text-gray-500 text-xs mt-1">Built for innovation and impact</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
