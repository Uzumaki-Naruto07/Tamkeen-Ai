from flask import Blueprint, jsonify, request

bp = Blueprint('emotion_detection_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "emotion_detection_routes API endpoint"})
