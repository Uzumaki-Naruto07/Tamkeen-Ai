from flask import Blueprint, jsonify, request

bp = Blueprint('career_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "career_routes API endpoint"})
