from flask import Blueprint, jsonify, request

bp = Blueprint('resume_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "resume_routes API endpoint"})
