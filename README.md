# Medium Article Movie Quotes Generator

A web application that generates relevant movie quotes for Medium articles based on the article topic, with optional Tavily search integration for enhanced relevance.

## Features

- Generate movie quotes relevant to your article topic
- Compare standard quotes with search-enhanced quotes 
- Clean, responsive UI for easy interaction
- Powered by OpenAI GPT-4o-mini and Tavily Search API

## Demo

![Application Screenshot](screenshot.png)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-quotes-app.git
   cd movie-quotes-app
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

## Usage

1. Start the application:
   ```bash
   python movie_quotes_app.py
   ```

2. Open your browser and navigate to `http://localhost:5000`

3. Enter your Medium article topic in the text area

4. Click "Generate Quotes" to see both standard and search-enhanced movie quotes

## How It Works

The application uses two methods to generate quotes:

- **Standard Quote**: Uses OpenAI's GPT-4o-mini to generate a relevant movie quote based only on the article topic
- **Enhanced Quote**: First searches for relevant movie quotes using the Tavily Search API, then uses that additional context with GPT-4o-mini to generate a more tailored quote

## Technologies Used

- **Backend**: Flask (Python)
- **AI**: OpenAI GPT-4o-mini
- **Search**: Tavily Search API
- **Frontend**: HTML, CSS, JavaScript

## Project Structure

```
movie-quotes-app/
├── movie_quotes_app.py    # Main application file
├── requirements.txt       # Project dependencies
├── .env                   # Environment variables (not in repo)
├── static/
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript files
└── templates/
    └── index.html         # Main application template
```

## API Reference

The application exposes one main endpoint:

- `POST /generate`: Accepts an article topic and returns both standard and search-enhanced quotes

## License

MIT

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/movie-quotes-app/issues).

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the GPT models
- [Tavily](https://tavily.com/) for their search API