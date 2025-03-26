from flask import Blueprint, jsonify, request

bp = Blueprint('language_model_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "language_model_routes API endpoint"})
