from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/json')
def json_test():
    data = {
        "message": "This is a JSON response",
        "number": 42,
        "boolean": True
    }
    return jsonify(data)

if __name__ == '__main__':
    print("Testing Flask with JSON on http://localhost:5110/json")
    app.run(host='0.0.0.0', port=5110) 