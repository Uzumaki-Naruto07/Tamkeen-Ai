from flask import Blueprint, jsonify, request

bp = Blueprint('analytics_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "analytics_routes API endpoint"})
