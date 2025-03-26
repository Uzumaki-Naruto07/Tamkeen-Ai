from flask import Blueprint, jsonify, request

bp = Blueprint('assessment_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "assessment_routes API endpoint"})
