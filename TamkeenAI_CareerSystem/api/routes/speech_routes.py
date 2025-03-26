from flask import Blueprint, jsonify, request

bp = Blueprint('speech_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "speech_routes API endpoint"})
