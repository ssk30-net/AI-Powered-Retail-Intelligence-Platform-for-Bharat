"""
Market Insights & Recommendations Engine
Generates actionable insights and recommendations based on REAL market data
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from .sentiment_analyzer import sentiment_analyzer

class InsightsEngine:
    def __init__(self):
        self.commodities = ['wheat', 'rice', 'corn', 'onion', 'tomato', 'potato', 'soybean']
        
    def generate_insights_overview(self) -> Dict:
        """
        Generate comprehensive market insights based on real sentiment analysis
        """
        # Get real sentiment data for all commodities
        sentiment_data = {}
        for commodity in self.commodities[:5]:  # Analyze top 5 to avoid rate limits
            try:
                data = sentiment_analyzer.get_commodity_sentiment(commodity, days=7)
                sentiment_data[commodity] = data
            except Exception as e:
                print(f"Error getting sentiment for {commodity}: {e}")
                continue
        
        # Generate insights based on real data
        opportunities = self._identify_opportunities(sentiment_data)
        risks = self._identify_risks(sentiment_data)
        recommendations = self._generate_recommendations(sentiment_data)
        
        return {
            'market_opportunities': opportunities,
            'market_risks': risks,
            'top_recommendations': recommendations,
            'insights_count': len(opportunities) + len(risks),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def _identify_opportunities(self, sentiment_data: Dict) -> List[Dict]:
        """
        Identify real opportunities based on sentiment analysis
        """
        opportunities = []
        
        for commodity, data in sentiment_data.items():
            sentiment_score = data.get('current_sentiment', 0)
            sentiment_label = data.get('sentiment_label', 'neutral')
            article_count = data.get('article_count', 0)
            articles = data.get('recent_news', [])
            
            # Opportunity 1: Strong positive sentiment (potential price increase)
            if sentiment_score > 0.3 and article_count >= 3:
                # Count positive articles
                positive_count = sum(1 for a in articles if a.get('sentiment') == 'positive')
                positive_pct = (positive_count / len(articles) * 100) if articles else 0
                
                # Extract key topics from positive articles
                positive_articles = [a for a in articles if a.get('sentiment') == 'positive']
                topics = self._extract_article_topics(positive_articles)
                topic_str = ', '.join(topics[:3]) if topics else 'market dynamics'
                
                opportunities.append({
                    'type': 'bullish_sentiment',
                    'title': f'{commodity.title()} Shows Strong Market Momentum',
                    'description': f'{commodity.title()} has {positive_pct:.0f}% positive news coverage based on {article_count} recent articles. '
                                  f'Key drivers: {topic_str}. This indicates potential upward price movement.',
                    'commodity': commodity.title(),
                    'impact': 'High' if sentiment_score > 0.5 else 'Medium',
                    'confidence': min(0.95, float(data.get('confidence', 0.7)) + (article_count * 0.02)),
                    'data_points': article_count
                })
            
            # Opportunity 2: Rising sentiment trend (momentum building)
            elif 0.1 < sentiment_score <= 0.3 and article_count >= 5:
                opportunities.append({
                    'type': 'emerging_opportunity',
                    'title': f'Emerging Opportunity in {commodity.title()}',
                    'description': f'{commodity.title()} showing moderate positive sentiment (score: {sentiment_score:.2f}). '
                                  f'Based on {article_count} articles analyzed. Early indicators suggest growing market interest.',
                    'commodity': commodity.title(),
                    'impact': 'Medium',
                    'confidence': 0.72,
                    'data_points': article_count
                })
            
            # Opportunity 3: High article volume (market attention)
            if article_count > 15:
                opportunities.append({
                    'type': 'high_attention',
                    'title': f'High Market Activity for {commodity.title()}',
                    'description': f'Significant market attention with {article_count} news articles in past week. '
                                  f'Increased media coverage often precedes price volatility and trading opportunities. '
                                  f'Current sentiment: {sentiment_label}.',
                    'commodity': commodity.title(),
                    'impact': 'Medium',
                    'confidence': 0.78,
                    'data_points': article_count
                })
        
        # Sort by impact and confidence
        opportunities.sort(key=lambda x: (
            1 if x['impact'] == 'High' else 0.5,
            x.get('confidence', 0.5)
        ), reverse=True)
        
        return opportunities[:5]  # Return top 5
    
    def _identify_risks(self, sentiment_data: Dict) -> List[Dict]:
        """
        Identify real risks based on sentiment analysis
        """
        risks = []
        
        for commodity, data in sentiment_data.items():
            sentiment_score = data.get('current_sentiment', 0)
            article_count = data.get('article_count', 0)
            articles = data.get('recent_news', [])
            
            # Risk 1: Strong negative sentiment
            if sentiment_score < -0.2 and article_count >= 3:
                negative_count = sum(1 for a in articles if a.get('sentiment') == 'negative')
                negative_pct = (negative_count / len(articles) * 100) if articles else 0
                
                negative_articles = [a for a in articles if a.get('sentiment') == 'negative']
                topics = self._extract_article_topics(negative_articles)
                risk_factors = ', '.join(topics[:3]) if topics else 'market concerns'
                
                risks.append({
                    'type': 'negative_sentiment',
                    'title': f'{commodity.title()} Facing Market Headwinds',
                    'description': f'{negative_pct:.0f}% of recent news coverage for {commodity} is negative '
                                  f'({negative_count}/{article_count} articles). Risk factors: {risk_factors}. '
                                  f'This may indicate downward price pressure.',
                    'severity': 'High' if sentiment_score < -0.4 else 'Medium',
                    'commodity': commodity.title(),
                    'probability': min(0.9, abs(sentiment_score) + 0.3),
                    'data_points': article_count
                })
            
            # Risk 2: Mixed/volatile sentiment (uncertainty)
            elif article_count >= 5:
                sentiments = [a.get('sentiment') for a in articles]
                positive = sentiments.count('positive')
                negative = sentiments.count('negative')
                neutral = sentiments.count('neutral')
                
                # High volatility = roughly equal positive and negative
                if positive > 0 and negative > 0 and abs(positive - negative) <= 3:
                    risks.append({
                        'type': 'volatility',
                        'title': f'High Volatility Expected in {commodity.title()}',
                        'description': f'{commodity.title()} shows mixed market signals: '
                                      f'{positive} positive, {negative} negative, {neutral} neutral articles. '
                                      f'This divergence suggests increased price volatility ahead.',
                        'severity': 'Medium',
                        'commodity': commodity.title(),
                        'probability': 0.65,
                        'data_points': article_count
                    })
            
            # Risk 3: Low coverage (uncertainty)
            if article_count <= 2:
                risks.append({
                    'type': 'low_data',
                    'title': f'Limited Market Data for {commodity.title()}',
                    'description': f'Only {article_count} news articles found for {commodity}. '
                                  f'Low media coverage may indicate reduced market liquidity or emerging supply issues. '
                                  f'Proceed with caution.',
                    'severity': 'Low',
                    'commodity': commodity.title(),
                    'probability': 0.50,
                    'data_points': article_count
                })
        
        # Sort by severity and probability
        risks.sort(key=lambda x: (
            1 if x['severity'] == 'High' else 0.5 if x['severity'] == 'Medium' else 0.2,
            x.get('probability', 0.5)
        ), reverse=True)
        
        return risks[:5]  # Return top 5
    
    def _generate_recommendations(self, sentiment_data: Dict) -> List[Dict]:
        """
        Generate actionable recommendations based on real data
        """
        recommendations = []
        
        # Analyze all commodities
        commodity_analysis = []
        for commodity, data in sentiment_data.items():
            commodity_analysis.append({
                'name': commodity,
                'sentiment': data.get('current_sentiment', 0),
                'article_count': data.get('article_count', 0),
                'label': data.get('sentiment_label', 'neutral')
            })
        
        # Sort by sentiment score
        commodity_analysis.sort(key=lambda x: x['sentiment'], reverse=True)
        
        # Recommendation 1: Best performing commodity
        if commodity_analysis:
            best = commodity_analysis[0]
            if best['sentiment'] > 0.1:
                action = 'Buy' if best['sentiment'] > 0.3 else 'Hold'
                confidence = min(95, int((abs(best['sentiment']) + 0.3) * 100))
                
                recommendations.append({
                    'action': action,
                    'commodity': best['name'].title(),
                    'confidence': confidence,
                    'reasoning': f"Strong positive sentiment ({best['sentiment']:.2f}) with {best['article_count']} supporting articles. "
                                f"Market indicators suggest {action.lower()} opportunity."
                })
        
        # Recommendation 2: Commodity to avoid (if any with very negative sentiment)
        worst = commodity_analysis[-1] if commodity_analysis else None
        if worst and worst['sentiment'] < -0.2:
            confidence = min(90, int((abs(worst['sentiment']) + 0.4) * 100))
            recommendations.append({
                'action': 'Monitor',
                'commodity': worst['name'].title(),
                'confidence': confidence,
                'reasoning': f"Negative sentiment ({worst['sentiment']:.2f}) detected. "
                            f"Based on {worst['article_count']} articles. Suggest monitoring before trading."
            })
        
        # Recommendation 3: Diversification based on mixed signals
        if len(commodity_analysis) >= 3:
            top_3 = commodity_analysis[:3]
            mixed_confidence = int(sum(c['article_count'] for c in top_3) / len(top_3) * 5 + 55)
            
            recommendations.append({
                'action': 'Diversify',
                'commodity': ', '.join([c['name'].title() for c in top_3]),
                'confidence': min(85, mixed_confidence),
                'reasoning': f"Portfolio diversification recommended across top-performing commodities. "
                            f"Spreads risk while capitalizing on positive market trends."
            })
        
        return recommendations[:5]  # Return top 5
    
    def _extract_article_topics(self, articles: List[Dict]) -> List[str]:
        """Extract key topics from articles"""
        if not articles:
            return []
        
        # Combine all titles
        text = ' '.join([a.get('title', '') + ' ' + a.get('summary', '') for a in articles])
        text_lower = text.lower()
        
        # Topic keywords
        topics = []
        if 'price' in text_lower or 'cost' in text_lower or 'expensive' in text_lower:
            topics.append('pricing trends')
        if 'supply' in text_lower or 'shortage' in text_lower or 'surplus' in text_lower:
            topics.append('supply dynamics')
        if 'demand' in text_lower or 'consumption' in text_lower:
            topics.append('demand patterns')
        if 'export' in text_lower or 'import' in text_lower or 'international' in text_lower:
            topics.append('trade activity')
        if 'weather' in text_lower or 'rain' in text_lower or 'drought' in text_lower:
            topics.append('weather impact')
        if 'government' in text_lower or 'policy' in text_lower or 'regulation' in text_lower:
            topics.append('policy changes')
        if 'harvest' in text_lower or 'crop' in text_lower or 'yield' in text_lower:
            topics.append('harvest conditions')
        
        return topics
    
    def get_commodity_specific_insights(self, commodity_id: int) -> Dict:
        """
        Get insights specific to a commodity
        """
        # Map commodity ID to name
        commodity_map = {1: 'wheat', 2: 'rice', 3: 'onion', 4: 'tomato', 5: 'potato', 6: 'corn', 7: 'soybean'}
        commodity_name = commodity_map.get(commodity_id, 'wheat')
        
        # Get real sentiment data
        try:
            sentiment_data = sentiment_analyzer.get_commodity_sentiment(commodity_name, days=7)
        except:
            sentiment_data = {'current_sentiment': 0, 'sentiment_label': 'neutral', 'article_count': 0}
        
        # Analyze sentiment strength
        sentiment_score = sentiment_data.get('current_sentiment', 0)
        
        if sentiment_score > 0.3:
            strength = 'Strong'
            score = int(min(95, (sentiment_score + 0.5) * 100))
        elif sentiment_score > 0.1:
            strength = 'Moderate'
            score = int((sentiment_score + 0.3) * 100)
        elif sentiment_score < -0.2:
            strength = 'Weak'
            score = int(max(20, (sentiment_score + 0.8) * 100))
        else:
            strength = 'Neutral'
            score = 50
        
        return {
            'commodity_name': commodity_name.title(),
            'commodity_id': commodity_id,
            'current_analysis': {
                'price_momentum': 'upward' if sentiment_score > 0.1 else 'downward' if sentiment_score < -0.1 else 'stable',
                'strength': strength,
                'score': score
            },
            'sentiment_score': sentiment_score,
            'article_count': sentiment_data.get('article_count', 0),
            'recommendations': self._generate_recommendations({commodity_name: sentiment_data})
        }

# Global instance
insights_engine = InsightsEngine()
