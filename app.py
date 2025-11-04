from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import cv2
import os
from skimage.feature import hog
from werkzeug.utils import secure_filename
# from flask_cors import CORS


app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})

# app = Flask(__name__, template_folder='../templates')  # Set the template folder


app = Flask(__name__)

# Load the trained SVM model
MODEL_PATH = (
    "C:\\Users\\Student\\Desktop\\Project\\svm_model.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    """Check if uploaded file has a valid extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(image_path):
    """Preprocess image before feeding it into the model."""
    try:
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("Invalid image file")

        image = cv2.resize(image, (128, 128))  # Resize to match training input size
        features = hog(image, pixels_per_cell=(8, 8), cells_per_block=(2, 2))

        return np.array(features).reshape(1, -1)  # Match training input format
    except Exception as e:
        print(f"Image processing error: {str(e)}")
        return None


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)

            image = preprocess_image(filepath)

            prediction = model.predict(image)[0]
            tumor_types = ["No Tumor", "Glioma", "Meningioma", "Pituitary"]
            result = tumor_types[prediction]

            print(f"Model Prediction: {result}")

            return jsonify({"prediction": result, "status": "success"})
        else:
            return jsonify({"error": "Invalid file format"}), 400

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/report", methods=["GET"])
def report():
    return render_template("report.html")  
if __name__ == "__main__":
    app.run(debug=True)
