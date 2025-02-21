from flask import Flask, jsonify
from flask_cors import CORS
import openai
import json
import re

app = Flask(__name__)
CORS(app)

# WARNING: Do NOT expose your API key in production!
openai.api_key = "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"

@app.route('/api/news')
def get_news():
    try:
        prompt = (
            "Given that I know the current market is down due to bear pressures and global cues, "
            "provide the top 3 latest news headlines in JSON format that reflect these market conditions. "
            "Each news item should have the following keys: title, category, time, and impact. "
            "Return only the JSON array without any additional text. "
            "For example: "
            '[{"title": "Market Slumps Amid Global Uncertainty", "category": "Economy", "time": "2h ago", "impact": "high"},'
            ' {"title": "Investors Brace for Extended Bear Market", "category": "Markets", "time": "4h ago", "impact": "medium"},'
            ' {"title": "Global Cues Trigger Downturn in Asian Markets", "category": "Global", "time": "6h ago", "impact": "medium"}]'
        )
        
        # Using the requested format
        client = openai
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an assistant that strictly outputs valid JSON matching the provided template."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=700
        )
        
        raw_content = response.choices[0].message.content.strip()
        # Remove any markdown formatting such as triple backticks if present.
        cleaned_content = re.sub(r"^```(?:json)?", "", raw_content)
        cleaned_content = re.sub(r"```$", "", cleaned_content).strip()
        print("Cleaned OpenAI response:", cleaned_content)
        
        # Attempt to parse the cleaned content as JSON.
        news_data = json.loads(cleaned_content)
        return jsonify(news_data)
    except Exception as e:
        print("Error in /api/news:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5010)
