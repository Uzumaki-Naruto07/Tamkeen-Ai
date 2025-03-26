from flask import Blueprint, jsonify, request

bp = Blueprint('job_application_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "job_application_routes API endpoint"})
