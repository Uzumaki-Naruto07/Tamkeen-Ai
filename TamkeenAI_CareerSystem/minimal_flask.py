from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World! Flask is working!'

if __name__ == '__main__':
    print("Starting minimal Flask server on http://localhost:5100")
    app.run(host='0.0.0.0', port=5100) 