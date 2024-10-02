import os
from dotenv import load_dotenv
import requests
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from groq import Groq

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

NEWS_BASE_URL = 'https://newsapi.org/v2/'

# Groq configuration
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)

def get_top_headlines(category='general', country='us'):
    url = f"{NEWS_BASE_URL}top-headlines?category={category}&country={country}&apiKey={os.getenv('NEWS_API_KEY')}"
    response = requests.get(url)
    return response.json()

def get_everything(q='news', sortBy='publishedAt'):
    url = f"{NEWS_BASE_URL}everything?q={q}&sortBy={sortBy}&apiKey={os.getenv('NEWS_API_KEY')}"
    response = requests.get(url)
    return response.json()

def get_ai_analysis(article):
    prompt = f"Provide a brief summary of the following news piece: {article['title']} {article['description']} {article['content']}"
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3-8b-8192",
    )
    return chat_completion.choices[0].message.content

@app.route('/api/top-headlines')
def api_top_headlines():
    page = int(request.args.get('page', 1))
    per_page = 3
    headlines = get_top_headlines()
    start = (page - 1) * per_page
    end = start + per_page
    paginated_articles = headlines['articles'][start:end]
    for article in paginated_articles:
        article['ai_analysis'] = get_ai_analysis(article)
    return jsonify({
        'articles': paginated_articles,
        'totalResults': headlines['totalResults'],
        'currentPage': page,
        'totalPages': (headlines['totalResults'] + per_page - 1) // per_page
    })

@app.route('/api/everything')
def api_everything():
    page = int(request.args.get('page', 1))
    per_page = 3
    news = get_everything()
    start = (page - 1) * per_page
    end = start + per_page
    paginated_articles = news['articles'][start:end]
    for article in paginated_articles:
        article['ai_analysis'] = get_ai_analysis(article)
    return jsonify({
        'articles': paginated_articles,
        'totalResults': news['totalResults'],
        'currentPage': page,
        'totalPages': (news['totalResults'] + per_page - 1) // per_page
    })

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)