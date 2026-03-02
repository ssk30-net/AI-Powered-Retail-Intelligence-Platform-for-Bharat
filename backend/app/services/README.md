# AI Services Directory

This directory contains the core AI/ML services that power the platform's intelligent features.

## 📁 Services

### `sentiment_analyzer.py`
**Purpose:** Analyzes market sentiment from news articles and text

**Features:**
- Dual-model NLP (VADER + TextBlob)
- Real-time news scraping from Google News RSS
- Commodity-specific sentiment analysis
- Trend tracking and topic extraction

**Usage:**
```python
from app.services.sentiment_analyzer import sentiment_analyzer

# Get sentiment for a commodity
result = sentiment_analyzer.get_commodity_sentiment("wheat", days=30)

# Analyze custom text
sentiment = sentiment_analyzer.analyze_text("Wheat prices expected to rise")
```

---

### `ai_copilot.py`
**Purpose:** Intelligent conversational AI assistant for market queries

**Features:**
- OpenAI GPT-3.5 integration (optional)
- Rule-based fallback intelligence
- Context-aware responses
- Conversation history tracking
- Follow-up suggestions

**Usage:**
```python
from app.services.ai_copilot import ai_copilot

# Chat with the copilot
response = ai_copilot.chat(
    message="What's the wheat price forecast?",
    user_id="user_123",
    context={"commodity": "wheat"}
)
```

**Note:** Works with or without OpenAI API key:
- **With key:** Uses GPT-3.5 for natural conversations
- **Without key:** Uses intelligent rule-based responses

---

### `insights_engine.py`
**Purpose:** Generates market insights, opportunities, and recommendations

**Features:**
- Opportunity detection (arbitrage, seasonal, export)
- Risk identification (weather, policy, supply)
- Actionable recommendations
- Performance analysis
- Multi-factor market analysis

**Usage:**
```python
from app.services.insights_engine import insights_engine

# Get comprehensive insights
insights = insights_engine.generate_insights_overview()

# Get commodity-specific insights
commodity_insights = insights_engine.get_commodity_specific_insights(1)
```

---

## 🔧 Configuration

### Required Dependencies
All required packages are in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Optional Setup

**For NLTK (first time only):**
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
```

**For OpenAI (optional):**
```bash
# Set in .env or environment
export OPENAI_API_KEY=sk-your-key-here
```

---

## 🚀 Adding New Services

To add a new service:

1. Create file: `your_service.py`
2. Implement service class
3. Create global instance: `your_service = YourService()`
4. Update `__init__.py`:
   ```python
   from .your_service import your_service
   __all__ = [..., 'your_service']
   ```
5. Use in routes:
   ```python
   from app.services.your_service import your_service
   ```

---

## 📊 Service Architecture

```
Routes (API Endpoints)
    ↓
Services (Business Logic + AI/ML)
    ↓
External APIs / Models
    ↓
Data Processing
    ↓
Response to User
```

---

## 🧪 Testing Services

```python
# Direct service testing
from app.services.sentiment_analyzer import sentiment_analyzer

# Test sentiment analysis
result = sentiment_analyzer.analyze_text("Great harvest season expected")
print(f"Sentiment: {result['sentiment']} ({result['score']})")

# Test copilot
from app.services.ai_copilot import ai_copilot
response = ai_copilot.chat("Tell me about wheat prices", "test_user")
print(response['response'])

# Test insights
from app.services.insights_engine import insights_engine
insights = insights_engine.generate_insights_overview()
print(f"Found {len(insights['market_opportunities'])} opportunities")
```

---

## 🔍 Debugging

### Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check service status:
```python
# Check if OpenAI is available
from app.services.ai_copilot import ai_copilot
print(f"Using OpenAI: {ai_copilot.use_openai}")

# Test news fetching
from app.services.sentiment_analyzer import sentiment_analyzer
articles = sentiment_analyzer.fetch_news_articles("wheat", max_articles=5)
print(f"Fetched {len(articles)} articles")
```

---

## 💡 Best Practices

1. **Error Handling:** All services have try-catch blocks with fallbacks
2. **Rate Limiting:** Be mindful of external API rate limits
3. **Caching:** Consider caching results for frequent queries
4. **Monitoring:** Log service performance and errors
5. **Testing:** Test services independently before integration

---

## 📚 Resources

- [VADER Sentiment](https://github.com/cjhutto/vaderSentiment)
- [TextBlob Documentation](https://textblob.readthedocs.io/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Google News RSS](https://news.google.com/rss)
