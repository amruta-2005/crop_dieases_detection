import cv2
import numpy as np
import sys
import json

FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def analyze_image(image_path):
    try:
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"Could not load image from {image_path}"}

        image = cv2.resize(image, (256, 256))
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

        lower_green = np.array([25, 40, 40])
        upper_green = np.array([95, 255, 255])
        lower_yellow = np.array([15, 35, 35])
        upper_yellow = np.array([40, 255, 255])
        lower_brown = np.array([5, 40, 20])
        upper_brown = np.array([25, 255, 200])

        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)

        total_pixels = image.shape[0] * image.shape[1]
        green_ratio = cv2.countNonZero(green_mask) / total_pixels
        yellow_ratio = cv2.countNonZero(yellow_mask) / total_pixels
        brown_ratio = cv2.countNonZero(brown_mask) / total_pixels

        exg = (2.0 * rgb[..., 1]) - rgb[..., 0] - rgb[..., 2]
        vegetation_ratio = float(np.mean(exg > 0.05))
        crop_like_ratio = max(green_ratio, yellow_ratio + brown_ratio)
        is_valid_crop = crop_like_ratio >= 0.08 or vegetation_ratio >= 0.08

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        if len(faces) > 0 and green_ratio < 0.75:
            is_valid_crop = False

        if not is_valid_crop:
            return {
                "label": "Non-crop image",
                "confidence": 0.0,
                "advice": "This image does not appear to be a crop or leaf. Disease percentage is 0%.",
                "percentage": 0.0,
                "is_valid_crop_image": False,
                "validation_message": "Upload a crop, leaf, or fruit image to calculate disease percentage."
            }

        disease_mask = cv2.bitwise_or(yellow_mask, brown_mask)
        diseased_pixels = cv2.countNonZero(disease_mask)
        plant_pixels = max(cv2.countNonZero(cv2.bitwise_or(green_mask, disease_mask)), 1)
        percentage = min((diseased_pixels / plant_pixels) * 100, 100.0)

        if percentage < 5:
            label = "Healthy"
            advice = "No visible disease detected. Continue monitoring."
        elif percentage < 20:
            label = "Early Blight"
            advice = "Rotate crops and apply recommended fungicide."
        else:
            label = "Late Blight"
            advice = "Start fungicide treatment and remove infected leaves."

        return {
            "label": label,
            "confidence": percentage / 100,
            "advice": advice,
            "percentage": percentage,
            "is_valid_crop_image": True,
            "validation_message": ""
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python analyze.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = analyze_image(image_path)
    print(json.dumps(result))
