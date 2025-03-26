from flask import Blueprint, jsonify, request

bp = Blueprint('user_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "user_routes API endpoint"})
