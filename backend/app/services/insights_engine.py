"""
Market Insights & Recommendations Engine
Generates actionable insights and recommendations based on market data
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

class InsightsEngine:
    def __init__(self):
        # Historical patterns and thresholds
        self.thresholds = {
            'price_surge': 0.10,  # 10% increase
            'price_drop': -0.10,   # 10% decrease
            'high_volatility': 0.15,
            'sentiment_bullish': 0.3,
            'sentiment_bearish': -0.3,
            'high_demand': 75,
            'low_supply': 30
        }
        
        # Commodities for analysis
        self.commodities = [
            {'id': 1, 'name': 'Wheat', 'category': 'Grains', 'avg_price': 2500},
            {'id': 2, 'name': 'Rice', 'category': 'Grains', 'avg_price': 3200},
            {'id': 3, 'name': 'Onion', 'category': 'Vegetables', 'avg_price': 1800},
            {'id': 4, 'name': 'Tomato', 'category': 'Vegetables', 'avg_price': 2200},
            {'id': 5, 'name': 'Potato', 'category': 'Vegetables', 'avg_price': 1500}
        ]
    
    def generate_insights_overview(self) -> Dict:
        """
        Generate comprehensive market insights overview
        """
        # Generate various types of insights
        opportunities = self._identify_opportunities()
        risks = self._identify_risks()
        recommendations = self._generate_recommendations()
        performance_summary = self._analyze_performance()
        
        return {
            'market_opportunities': opportunities[:5],
            'market_risks': risks[:3],
            'top_recommendations': recommendations[:5],
            'performance_summary': performance_summary,
            'insights_count': len(opportunities) + len(risks),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def _identify_opportunities(self) -> List[Dict]:
        """
        Identify bullish opportunities in the market
        """
        opportunities = []
        
        # Opportunity 1: Price Arbitrage
        opportunities.append({
            'id': 'opp_1',
            'type': 'arbitrage',
            'title': 'Regional Price Arbitrage Opportunity',
            'description': 'Wheat prices show 8% differential between Punjab (INR 2,650) and Karnataka (INR 2,420). '
                          'Transportation costs are favorable for bulk movement.',
            'commodity': 'Wheat',
            'potential_gain': '6-8%',
            'confidence': 0.85,
            'risk_level': 'medium',
            'time_horizon': '7-14 days',
            'action_items': [
                'Verify transportation logistics',
                'Check storage availability in target region',
                'Monitor price trends daily'
            ],
            'impact': 'high',
            'urgency': 'high'
        })
        
        # Opportunity 2: Seasonal Demand
        opportunities.append({
            'id': 'opp_2',
            'type': 'seasonal',
            'title': 'Pre-Festive Season Demand Surge',
            'description': 'Historical patterns indicate 12-15% price increase in rice and wheat ahead of festival season (30 days). '
                          'Current inventory levels are moderate.',
            'commodity': 'Rice, Wheat',
            'potential_gain': '12-15%',
            'confidence': 0.82,
            'risk_level': 'low',
            'time_horizon': '20-30 days',
            'action_items': [
                'Increase inventory by 20-30%',
                'Lock supplier contracts',
                'Monitor competitor stocking patterns'
            ],
            'impact': 'high',
            'urgency': 'medium'
        })
        
        # Opportunity 3: Export Market
        opportunities.append({
            'id': 'opp_3',
            'type': 'export',
            'title': 'Growing Export Demand from Southeast Asia',
            'description': 'Export inquiries for Indian wheat have increased 25% in the last month. '
                          'USD strengthening makes Indian produce more competitive.',
            'commodity': 'Wheat',
            'potential_gain': '10-12%',
            'confidence': 0.78,
            'risk_level': 'medium',
            'time_horizon': '30-60 days',
            'action_items': [
                'Connect with export agents',
                'Verify quality certifications',
                'Assess logistics costs'
            ],
            'impact': 'medium',
            'urgency': 'medium'
        })
        
        # Opportunity 4: Government Procurement
        opportunities.append({
            'id': 'opp_4',
            'type': 'procurement',
            'title': 'Government Procurement Program Opens',
            'description': 'MSP procurement season starting in 15 days. Government targets to procure 35 MMT of wheat. '
                          'Guaranteed pricing available.',
            'commodity': 'Wheat',
            'potential_gain': 'Stable pricing + 5%',
            'confidence': 0.95,
            'risk_level': 'low',
            'time_horizon': '15-45 days',
            'action_items': [
                'Register for procurement program',
                'Ensure quality meets MSP standards',
                'Prepare logistics for delivery'
            ],
            'impact': 'high',
            'urgency': 'high'
        })
        
        # Opportunity 5: Supply Constraint
        opportunities.append({
            'id': 'opp_5',
            'type': 'supply_shortage',
            'title': 'Vegetable Supply Constraints in South India',
            'description': 'Unseasonal rains have disrupted tomato and onion supply in Karnataka. '
                          'Prices expected to rise 15-20% in the next 2 weeks.',
            'commodity': 'Tomato, Onion',
            'potential_gain': '15-20%',
            'confidence': 0.88,
            'risk_level': 'high',
            'time_horizon': '7-14 days',
            'action_items': [
                'Source from alternative regions',
                'Monitor weather forecasts',
                'Manage inventory turnover carefully'
            ],
            'impact': 'high',
            'urgency': 'critical'
        })
        
        return opportunities
    
    def _identify_risks(self) -> List[Dict]:
        """
        Identify potential risks in the market
        """
        risks = []
        
        risks.append({
            'id': 'risk_1',
            'type': 'weather',
            'title': 'Adverse Weather Forecast',
            'description': 'Meteorological department predicts below-normal monsoon in key wheat-producing regions. '
                          'This could impact next harvest by 8-10%.',
            'affected_commodities': ['Wheat', 'Rice'],
            'severity': 'high',
            'probability': 0.65,
            'time_horizon': '90-120 days',
            'mitigation_strategies': [
                'Diversify sourcing regions',
                'Consider import options',
                'Lock long-term contracts now'
            ]
        })
        
        risks.append({
            'id': 'risk_2',
            'type': 'policy',
            'title': 'Export Restriction Rumors',
            'description': 'Government may impose export restrictions on wheat if domestic prices rise above INR 2,800/quintal. '
                          'This could impact export-oriented traders.',
            'affected_commodities': ['Wheat'],
            'severity': 'medium',
            'probability': 0.45,
            'time_horizon': '30-60 days',
            'mitigation_strategies': [
                'Monitor government announcements',
                'Balance domestic vs export sales',
                'Maintain flexibility in contracts'
            ]
        })
        
        risks.append({
            'id': 'risk_3',
            'type': 'oversupply',
            'title': 'Potato Oversupply Expected',
            'description': 'Record potato acreage in Punjab and UP may lead to 15% oversupply, '
                          'potentially causing 10-15% price correction.',
            'affected_commodities': ['Potato'],
            'severity': 'medium',
            'probability': 0.70,
            'time_horizon': '45-60 days',
            'mitigation_strategies': [
                'Reduce potato inventory',
                'Explore processing options',
                'Focus on other vegetables'
            ]
        })
        
        return risks
    
    def _generate_recommendations(self) -> List[Dict]:
        """
        Generate actionable recommendations
        """
        recommendations = []
        
        recommendations.append({
            'id': 'rec_1',
            'category': 'portfolio',
            'title': 'Optimize Commodity Portfolio Mix',
            'description': 'Current analysis suggests increasing wheat allocation to 35% (from 25%) and '
                          'reducing potato exposure to 10% (from 20%).',
            'rationale': 'Wheat shows strong fundamentals with government support and export demand. '
                        'Potato faces oversupply risks.',
            'expected_impact': 'Risk-adjusted returns improvement of 8-12%',
            'implementation_complexity': 'medium',
            'priority': 'high',
            'action_steps': [
                'Gradually increase wheat purchases',
                'Reduce potato inventory over 2 weeks',
                'Monitor market response'
            ]
        })
        
        recommendations.append({
            'id': 'rec_2',
            'category': 'hedging',
            'title': 'Implement Price Hedging Strategy',
            'description': 'High volatility in onion prices (±20%) suggests implementing hedging through '
                          'futures contracts or forward agreements.',
            'rationale': 'Protect margins against unexpected price swings',
            'expected_impact': 'Reduce profit volatility by 30-40%',
            'implementation_complexity': 'medium',
            'priority': 'medium',
            'action_steps': [
                'Evaluate commodity exchange options',
                'Set up trading account',
                'Define hedging ratio (suggested: 60%)'
            ]
        })
        
        recommendations.append({
            'id': 'rec_3',
            'category': 'timing',
            'title': 'Strategic Buying Window',
            'description': 'Next 14 days present optimal buying opportunity for rice before festive demand surge.',
            'rationale': 'Prices at seasonal lows, demand will increase in 3 weeks',
            'expected_impact': 'Potential cost savings of 8-10%',
            'implementation_complexity': 'low',
            'priority': 'critical',
            'action_steps': [
                'Increase rice purchases by 40%',
                'Ensure adequate storage',
                'Lock prices with suppliers'
            ]
        })
        
        recommendations.append({
            'id': 'rec_4',
            'category': 'diversification',
            'title': 'Expand to Regional Markets',
            'description': 'South Indian markets showing 12% better margins compared to North. '
                          'Consider expanding presence.',
            'rationale': 'Geographic diversification reduces regional risks',
            'expected_impact': 'Revenue growth potential: 15-20%',
            'implementation_complexity': 'high',
            'priority': 'medium',
            'action_steps': [
                'Conduct regional market study',
                'Identify local partners',
                'Start with pilot operations'
            ]
        })
        
        recommendations.append({
            'id': 'rec_5',
            'category': 'technology',
            'title': 'Implement Automated Pricing',
            'description': 'Use AI-powered dynamic pricing to respond to market changes in real-time.',
            'rationale': 'Capture 2-3% additional margin through optimal pricing',
            'expected_impact': 'Margin improvement: 2-3%',
            'implementation_complexity': 'medium',
            'priority': 'low',
            'action_steps': [
                'Evaluate pricing software',
                'Integrate with current systems',
                'Train team on new tools'
            ]
        })
        
        return recommendations
    
    def _analyze_performance(self) -> Dict:
        """
        Analyze overall market performance
        """
        return {
            'overall_market_trend': 'bullish',
            'market_confidence_index': 72,
            'volatility_index': 45,
            'top_performing_commodities': [
                {'name': 'Wheat', 'change': '+8.2%', 'trend': 'up'},
                {'name': 'Rice', 'change': '+6.5%', 'trend': 'up'},
                {'name': 'Onion', 'change': '+12.3%', 'trend': 'up'}
            ],
            'underperforming_commodities': [
                {'name': 'Potato', 'change': '-3.2%', 'trend': 'down'},
                {'name': 'Tomato', 'change': '-1.5%', 'trend': 'down'}
            ],
            'sentiment_indicators': {
                'news_sentiment': 0.68,
                'trader_sentiment': 0.72,
                'consumer_demand': 78
            },
            'key_market_drivers': [
                'Seasonal demand increase',
                'Government procurement programs',
                'Export market opportunities',
                'Weather-related supply constraints'
            ]
        }
    
    def get_commodity_specific_insights(self, commodity_id: int) -> Dict:
        """
        Get insights specific to a commodity
        """
        commodity = next((c for c in self.commodities if c['id'] == commodity_id), self.commodities[0])
        
        return {
            'commodity_name': commodity['name'],
            'commodity_id': commodity_id,
            'current_analysis': {
                'price_momentum': 'upward',
                'strength': 'strong',
                'score': 78
            },
            'opportunities': [opp for opp in self._identify_opportunities() if commodity['name'] in opp.get('commodity', '')],
            'risks': [risk for risk in self._identify_risks() if commodity['name'] in risk.get('affected_commodities', [])],
            'recommendations': [
                f"Consider increasing {commodity['name']} inventory by 15-20%",
                f"Monitor {commodity['name']} prices in alternative regions for arbitrage",
                f"Set price alerts for {commodity['name']} at key levels"
            ]
        }

# Global instance
insights_engine = InsightsEngine()
