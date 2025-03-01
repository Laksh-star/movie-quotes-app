import os
import openai
from flask import Flask, render_template, request, jsonify, session
import requests
import json
import datetime
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quotes_history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
model = "gpt-4o-mini"

# Configure Tavily API
tavily_api_key = os.getenv("TAVILY_API_KEY")

# Define the history model
class QuoteHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    article_topic = db.Column(db.String(500), nullable=False)
    quotes_without_search = db.Column(db.Text, nullable=False)
    quotes_with_search = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<QuoteHistory {self.article_topic}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'article_topic': self.article_topic,
            'quotes_without_search': json.loads(self.quotes_without_search),
            'quotes_with_search': json.loads(self.quotes_with_search),
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

def generate_quote_without_search(article_topic):
    """Generate two movie quotes without using external search"""
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant movie quotes."},
                {"role": "user", "content": f"Generate TWO famous movie quotes that would be relevant to a Medium article about: '{article_topic}'. Return ONLY the quotes and the movie names in this format for each quote: 'Quote' - Movie (Year)"}
            ],
            max_tokens=200
        )
        quotes_text = response.choices[0].message.content
        # Split the quotes by newline if they're formatted that way
        quotes = [q.strip() for q in quotes_text.split('\n') if q.strip()]
        # If there's only one quote or the splitting didn't work as expected
        if len(quotes) < 2:
            quotes = [quotes_text.strip(), "\"Could not generate a second quote.\" - Movie Quote Generator (2025)"]
        return quotes[:2]  # Ensure we only return 2 quotes
    except Exception as e:
        return [f"Error: {str(e)}", "\"Error generating quote.\" - Movie Quote Generator (2025)"]

def generate_quote_with_search(article_topic):
    """Generate two movie quotes using Tavily search for enhanced relevance"""
    try:
        # First, search for relevant information using Tavily
        search_url = "https://api.tavily.com/search"
        search_params = {
            "api_key": tavily_api_key,
            "query": f"famous movie quotes related to {article_topic}",
            "search_depth": "basic",
            "include_domains": ["imdb.com", "rottentomatoes.com", "moviequotes.com"],
            "max_results": 5
        }
        
        search_response = requests.post(search_url, json=search_params)
        search_results = search_response.json()
        
        # Format search results for context
        context = "Based on the following information about movie quotes:\n"
        for result in search_results.get("results", []):
            context += f"- {result.get('title')}: {result.get('content')[:200]}...\n"
        
        # Generate quotes using the search results as context
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant movie quotes based on search results."},
                {"role": "user", "content": f"{context}\n\nGenerate TWO different famous movie quotes that would be relevant to a Medium article about: '{article_topic}'. Make sure the quotes are distinct from each other. Return ONLY the quotes and the movie names in this format for each quote: 'Quote' - Movie (Year)"}
            ],
            max_tokens=200
        )
        quotes_text = response.choices[0].message.content
        # Split the quotes by newline if they're formatted that way
        quotes = [q.strip() for q in quotes_text.split('\n') if q.strip()]
        # If there's only one quote or the splitting didn't work as expected
        if len(quotes) < 2:
            quotes = [quotes_text.strip(), "\"Could not generate a second quote.\" - Movie Quote Generator (2025)"]
        return quotes[:2]  # Ensure we only return 2 quotes
    except Exception as e:
        return [f"Error: {str(e)}", "\"Error generating quote.\" - Movie Quote Generator (2025)"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    article_topic = request.form.get('article_topic', '')
    
    if not article_topic:
        return jsonify({"error": "Please provide an article topic"})
    
    quotes_without_search = generate_quote_without_search(article_topic)
    quotes_with_search = generate_quote_with_search(article_topic)
    
    # Save to history
    history_entry = QuoteHistory(
        article_topic=article_topic,
        quotes_without_search=json.dumps(quotes_without_search),
        quotes_with_search=json.dumps(quotes_with_search)
    )
    db.session.add(history_entry)
    db.session.commit()
    
    return jsonify({
        "quotes_without_search": quotes_without_search,
        "quotes_with_search": quotes_with_search,
        "timestamp": history_entry.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route('/history', methods=['GET'])
def get_history():
    history = QuoteHistory.query.order_by(QuoteHistory.timestamp.desc()).all()
    return jsonify([entry.to_dict() for entry in history])

@app.route('/history/<int:history_id>', methods=['GET'])
def get_history_entry(history_id):
    entry = QuoteHistory.query.get_or_404(history_id)
    return jsonify(entry.to_dict())

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)