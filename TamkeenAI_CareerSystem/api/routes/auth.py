from flask import Blueprint, jsonify, request

bp = Blueprint('auth', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "auth API endpoint"})
