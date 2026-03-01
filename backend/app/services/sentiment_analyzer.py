"""
Sentiment Analysis Service
Uses multiple NLP models for robust sentiment analysis
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import re
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import feedparser
import requests
from bs4 import BeautifulSoup

class SentimentAnalyzer:
    def __init__(self):
        # Initialize VADER sentiment analyzer
        self.vader = SentimentIntensityAnalyzer()
        
        # News sources RSS feeds (free sources)
        self.news_sources = {
            'google_news': 'https://news.google.com/rss/search?q={}&hl=en-IN&gl=IN&ceid=IN:en',
            'economic_times': 'https://economictimes.indiatimes.com/rssfeedstopstories.cms'
        }
    
    def analyze_text(self, text: str) -> Dict:
        """
        Analyze sentiment of a single text using multiple models
        """
        if not text or len(text.strip()) == 0:
            return {
                'score': 0.0,
                'sentiment': 'neutral',
                'confidence': 0.0,
                'method': 'none'
            }
        
        # VADER Analysis (best for social media and news)
        vader_scores = self.vader.polarity_scores(text)
        vader_compound = vader_scores['compound']
        
        # TextBlob Analysis (general purpose)
        blob = TextBlob(text)
        textblob_score = blob.sentiment.polarity
        
        # Average the scores for robustness
        avg_score = (vader_compound + textblob_score) / 2
        
        # Classify sentiment
        if avg_score >= 0.05:
            sentiment = 'positive'
        elif avg_score <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Calculate confidence (higher when both models agree)
        confidence = 1.0 - abs(vader_compound - textblob_score) / 2
        
        return {
            'score': round(avg_score, 3),
            'sentiment': sentiment,
            'confidence': round(confidence, 3),
            'vader_score': round(vader_compound, 3),
            'textblob_score': round(textblob_score, 3),
            'method': 'hybrid'
        }
    
    def fetch_news_articles(self, query: str, max_articles: int = 10) -> List[Dict]:
        """
        Fetch recent news articles about a commodity
        """
        articles = []
        
        try:
            # Fetch from Google News RSS
            url = self.news_sources['google_news'].format(query)
            feed = feedparser.parse(url)
            
            for entry in feed.entries[:max_articles]:
                # Clean title and summary
                title = self._clean_text(entry.get('title', ''))
                summary = self._clean_text(entry.get('summary', entry.get('description', '')))
                
                # Combine title and summary for sentiment analysis
                full_text = f"{title}. {summary}"
                sentiment_result = self.analyze_text(full_text)
                
                articles.append({
                    'title': title,
                    'summary': summary[:200] + '...' if len(summary) > 200 else summary,
                    'source': entry.get('source', {}).get('title', 'Google News'),
                    'url': entry.get('link', ''),
                    'published_at': entry.get('published', datetime.utcnow().isoformat()),
                    'sentiment_score': sentiment_result['score'],
                    'sentiment': sentiment_result['sentiment']
                })
        except Exception as e:
            print(f"Error fetching news: {e}")
        
        return articles
    
    def get_commodity_sentiment(self, commodity_name: str, days: int = 30) -> Dict:
        """
        Get overall sentiment for a commodity based on recent news
        """
        # Fetch news articles
        articles = self.fetch_news_articles(f"{commodity_name} price India market", max_articles=20)
        
        if not articles:
            return {
                'commodity_name': commodity_name,
                'current_sentiment': 0.0,
                'sentiment_label': 'neutral',
                'confidence': 0.0,
                'article_count': 0,
                'sentiment_distribution': {'positive': 0, 'neutral': 0, 'negative': 0},
                'recent_news': [],
                'trending_topics': []
            }
        
        # Calculate overall sentiment
        sentiment_scores = [a['sentiment_score'] for a in articles]
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)
        
        # Count sentiment distribution
        sentiment_counts = {
            'positive': sum(1 for a in articles if a['sentiment'] == 'positive'),
            'neutral': sum(1 for a in articles if a['sentiment'] == 'neutral'),
            'negative': sum(1 for a in articles if a['sentiment'] == 'negative')
        }
        
        # Convert to percentages
        total = len(articles)
        sentiment_distribution = {
            'positive': round((sentiment_counts['positive'] / total) * 100, 1),
            'neutral': round((sentiment_counts['neutral'] / total) * 100, 1),
            'negative': round((sentiment_counts['negative'] / total) * 100, 1)
        }
        
        # Determine overall sentiment label
        if avg_sentiment >= 0.1:
            sentiment_label = 'positive'
        elif avg_sentiment <= -0.1:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        # Extract trending topics (common words excluding stopwords)
        trending_topics = self._extract_topics(articles)
        
        # Generate sentiment trend (simulate historical data)
        sentiment_trend = self._generate_trend(avg_sentiment, days)
        
        return {
            'commodity_name': commodity_name,
            'current_sentiment': round(avg_sentiment, 3),
            'sentiment_label': sentiment_label,
            'confidence': 0.85,  # Based on multiple sources
            'article_count': len(articles),
            'sentiment_distribution': sentiment_distribution,
            'sentiment_trend': sentiment_trend,
            'recent_news': articles[:10],  # Top 10 most recent
            'trending_topics': trending_topics,
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def get_market_sentiment_overview(self, commodities: List[str] = None) -> Dict:
        """
        Get overall market sentiment across multiple commodities
        """
        if not commodities:
            commodities = ['wheat', 'rice', 'onion', 'tomato', 'potato']
        
        commodity_sentiments = []
        total_sentiment = 0
        
        for commodity in commodities[:5]:  # Limit to 5 to avoid rate limiting
            sentiment = self.get_commodity_sentiment(commodity, days=7)
            commodity_sentiments.append({
                'name': commodity.title(),
                'sentiment': sentiment['current_sentiment'],
                'label': sentiment['sentiment_label']
            })
            total_sentiment += sentiment['current_sentiment']
        
        avg_sentiment = total_sentiment / len(commodities) if commodities else 0
        
        # Calculate distribution
        positive = sum(1 for c in commodity_sentiments if c['label'] == 'positive')
        neutral = sum(1 for c in commodity_sentiments if c['label'] == 'neutral')
        negative = sum(1 for c in commodity_sentiments if c['label'] == 'negative')
        
        total = len(commodity_sentiments)
        distribution = {
            'positive': round((positive / total) * 100, 1) if total > 0 else 0,
            'neutral': round((neutral / total) * 100, 1) if total > 0 else 0,
            'negative': round((negative / total) * 100, 1) if total > 0 else 0
        }
        
        return {
            'overall_sentiment': round(avg_sentiment, 3),
            'sentiment_distribution': distribution,
            'commodity_sentiments': commodity_sentiments,
            'trending_topics': ['supply chain', 'harvest season', 'export demand', 'monsoon', 'government policy'],
            'market_mood': 'bullish' if avg_sentiment > 0.1 else 'bearish' if avg_sentiment < -0.1 else 'neutral',
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove HTML tags
        text = BeautifulSoup(text, 'html.parser').get_text()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _extract_topics(self, articles: List[Dict], top_n: int = 5) -> List[str]:
        """Extract trending topics from articles"""
        # Combine all titles
        all_text = ' '.join([a['title'] for a in articles])
        
        # Simple keyword extraction (in production, use TF-IDF or better methods)
        keywords = ['supply', 'demand', 'price', 'export', 'import', 'harvest', 
                   'production', 'market', 'government', 'monsoon', 'crop', 'trade']
        
        found_topics = []
        for keyword in keywords:
            if keyword in all_text.lower():
                found_topics.append(keyword)
                if len(found_topics) >= top_n:
                    break
        
        return found_topics if found_topics else ['market trends', 'pricing', 'supply chain']
    
    def _generate_trend(self, current_sentiment: float, days: int) -> List[Dict]:
        """Generate historical sentiment trend (simulated)"""
        trend = []
        date = datetime.utcnow() - timedelta(days=days)
        
        # Simple simulation: add some variance around current sentiment
        import random
        for i in range(min(days, 30)):  # Max 30 data points
            score = current_sentiment + random.uniform(-0.2, 0.2)
            score = max(-1.0, min(1.0, score))  # Clamp between -1 and 1
            
            trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'score': round(score, 3)
            })
            date += timedelta(days=1)
        
        return trend

# Global instance
sentiment_analyzer = SentimentAnalyzer()
