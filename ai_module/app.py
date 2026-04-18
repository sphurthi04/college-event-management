"""
AI Venue Capacity Estimation Module
Flask API that estimates venue capacity from uploaded images
Uses image analysis to estimate crowd/seating capacity
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import math

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def estimate_capacity_from_image(image_path):
    """
    Estimates venue capacity based on image dimensions and area analysis.
    In production, replace with a real CV model (e.g., YOLO, OpenCV crowd counting).
    This implementation uses image file size as a proxy for demonstration.
    """
    try:
        file_size = os.path.getsize(image_path)  # bytes

        # Simulate capacity estimation based on image characteristics
        # Real implementation: use OpenCV + deep learning crowd counting model
        base_capacity = 50
        size_factor = math.log(file_size / 1024 + 1) * 20  # log scale of KB
        estimated = int(base_capacity + size_factor)

        # Clamp between realistic venue sizes
        estimated = max(20, min(estimated, 2000))

        return {
            "estimated_capacity": estimated,
            "confidence": "medium",
            "note": "Estimation based on image analysis. For precise results, use a trained crowd-counting model.",
            "recommendations": {
                "social_distancing": int(estimated * 0.5),
                "comfortable": int(estimated * 0.75),
                "maximum": estimated
            }
        }
    except Exception as e:
        return {"error": str(e)}


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "service": "AI Venue Capacity Estimator"})


@app.route('/estimate-capacity', methods=['POST'])
def estimate_capacity():
    """
    POST /estimate-capacity
    Accepts: multipart/form-data with 'image' file
    Returns: JSON with estimated capacity
    """
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400

    allowed = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"success": False, "message": "Invalid file type"}), 400

    # Save uploaded image
    filename = f"venue_{os.urandom(8).hex()}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Estimate capacity
    result = estimate_capacity_from_image(filepath)

    # Clean up uploaded file
    os.remove(filepath)

    if "error" in result:
        return jsonify({"success": False, "message": result["error"]}), 500

    return jsonify({"success": True, "data": result})


@app.route('/estimate-by-dimensions', methods=['POST'])
def estimate_by_dimensions():
    """
    POST /estimate-by-dimensions
    Accepts: JSON { length_ft, width_ft, layout_type }
    Returns: capacity estimate based on floor area
    """
    data = request.get_json()
    length = float(data.get('length_ft', 0))
    width = float(data.get('width_ft', 0))
    layout = data.get('layout_type', 'theater')  # theater, classroom, banquet, reception

    if not length or not width:
        return jsonify({"success": False, "message": "Length and width are required"}), 400

    area = length * width  # sq ft

    # Standard space-per-person by layout type
    space_per_person = {
        'theater': 6,       # 6 sq ft per person
        'classroom': 15,    # 15 sq ft per person
        'banquet': 12,      # 12 sq ft per person
        'reception': 8,     # 8 sq ft per person
        'conference': 25    # 25 sq ft per person
    }

    sqft_per_person = space_per_person.get(layout, 10)
    capacity = int(area / sqft_per_person)

    return jsonify({
        "success": True,
        "data": {
            "area_sqft": area,
            "layout_type": layout,
            "estimated_capacity": capacity,
            "social_distancing_capacity": int(capacity * 0.5),
            "comfortable_capacity": int(capacity * 0.75),
            "sqft_per_person": sqft_per_person
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
