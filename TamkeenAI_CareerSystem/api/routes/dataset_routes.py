from flask import Blueprint, jsonify, request

bp = Blueprint('dataset_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "dataset_routes API endpoint"})
