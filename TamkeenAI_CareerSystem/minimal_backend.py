from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Sample data
users = [
    {"id": 1, "username": "admin", "password": "password123", "roles": ["admin"]},
    {"id": 2, "username": "user", "password": "password123", "roles": ["user"]}
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "TamkeenAI Career System API is running"})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    for user in users:
        if user['username'] == username and user['password'] == password:
            # In a real app, generate a JWT token here
            return jsonify({
                "success": True,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "roles": user["roles"]
                },
                "token": "sample-token-123"
            })
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/resume/analyze', methods=['POST'])
def analyze_resume():
    # Sample response for testing frontend
    return jsonify({
        "ats_score": 85,
        "keywords_matched": ["python", "react", "leadership"],
        "missing_keywords": ["docker", "kubernetes"],
        "improvements": [
            "Add more quantifiable achievements",
            "Include relevant certifications",
            "Highlight leadership experience"
        ]
    })

if __name__ == '__main__':
    print("Starting Minimal TamkeenAI Backend on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 