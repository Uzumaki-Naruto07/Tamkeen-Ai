from flask import Blueprint, jsonify, request

bp = Blueprint('guidance_routes', __name__)

@bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "guidance_routes API endpoint"})
