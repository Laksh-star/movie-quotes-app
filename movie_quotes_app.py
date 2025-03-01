import os
import openai
from flask import Flask, render_template, request, jsonify
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
model = "gpt-4o-mini"

# Configure Tavily API
tavily_api_key = os.getenv("TAVILY_API_KEY")

def generate_quote_without_search(article_topic):
    """Generate a movie quote without using external search"""
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant movie quotes."},
                {"role": "user", "content": f"Generate a famous movie quote that would be relevant to a Medium article about: '{article_topic}'. Return ONLY the quote and the movie name in this format: 'Quote' - Movie (Year)"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

def generate_quote_with_search(article_topic):
    """Generate a movie quote using Tavily search for enhanced relevance"""
    try:
        # First, search for relevant information using Tavily
        search_url = "https://api.tavily.com/search"
        search_params = {
            "api_key": tavily_api_key,
            "query": f"famous movie quotes related to {article_topic}",
            "search_depth": "basic",
            "include_domains": ["imdb.com", "rottentomatoes.com", "moviequotes.com"],
            "max_results": 3
        }
        
        search_response = requests.post(search_url, json=search_params)
        search_results = search_response.json()
        
        # Format search results for context
        context = "Based on the following information about movie quotes:\n"
        for result in search_results.get("results", []):
            context += f"- {result.get('title')}: {result.get('content')[:200]}...\n"
        
        # Generate quote using the search results as context
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant movie quotes based on search results."},
                {"role": "user", "content": f"{context}\n\nGenerate a famous movie quote that would be relevant to a Medium article about: '{article_topic}'. Return ONLY the quote and the movie name in this format: 'Quote' - Movie (Year)"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    article_topic = request.form.get('article_topic', '')
    
    if not article_topic:
        return jsonify({"error": "Please provide an article topic"})
    
    quote_without_search = generate_quote_without_search(article_topic)
    quote_with_search = generate_quote_with_search(article_topic)
    
    return jsonify({
        "quote_without_search": quote_without_search,
        "quote_with_search": quote_with_search
    })

if __name__ == '__main__':
    app.run(debug=True)