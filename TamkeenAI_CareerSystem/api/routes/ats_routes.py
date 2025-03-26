from flask import Blueprint, jsonify, request

bp = Blueprint('ats_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "ATS API endpoint"})

@bp.route('/analyze', methods=['POST'])
def analyze():
    # Handle resume analysis
    data = request.json
    return jsonify({"result": "Resume analyzed", "data": data})
