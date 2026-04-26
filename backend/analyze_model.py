import os
import json
import sys
from pathlib import Path

import numpy as np


os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
import tensorflow as tf

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT_DIR / "ml" / "artifacts" / "plant_disease_classifier.keras"
METADATA_PATH = ROOT_DIR / "ml" / "artifacts" / "class_names.json"
MIN_PLANT_CONFIDENCE = float(os.getenv("MIN_PLANT_CONFIDENCE", "0.26"))
MIN_CONFIDENCE_GAP = float(os.getenv("MIN_CONFIDENCE_GAP", "0.04"))
MIN_GREEN_RATIO = float(os.getenv("MIN_GREEN_RATIO", "0.05"))
MIN_VEGETATION_RATIO = float(os.getenv("MIN_VEGETATION_RATIO", "0.08"))
MIN_DISEASED_RATIO = float(os.getenv("MIN_DISEASED_RATIO", "0.015"))
HIGH_CONFIDENCE_OVERRIDE = float(os.getenv("HIGH_CONFIDENCE_OVERRIDE", "0.82"))
MODEL_CONFIDENCE_OVERRIDE = float(os.getenv("MODEL_CONFIDENCE_OVERRIDE", "0.45"))

MODEL = None
METADATA = None


def load_assets():
    global MODEL, METADATA

    if MODEL is None:
        MODEL = tf.keras.models.load_model(MODEL_PATH)
    if METADATA is None:
        METADATA = json.loads(METADATA_PATH.read_text(encoding="utf-8"))


def predict_image(image_path: str):
    load_assets()

    image_size = int(METADATA.get("image_size", 160))
    image = tf.keras.utils.load_img(image_path, target_size=(image_size, image_size))
    array = tf.keras.utils.img_to_array(image)
    batch = np.expand_dims(array, axis=0)
    rgb = array / 255.0

    scores = MODEL.predict(batch, verbose=0)[0]
    sorted_indices = np.argsort(scores)[::-1]
    index = int(sorted_indices[0])
    second_index = int(sorted_indices[1]) if len(sorted_indices) > 1 else index
    raw_label = METADATA["class_names"][index]
    label = METADATA["display_names"].get(raw_label, raw_label)
    confidence = float(scores[index])
    second_confidence = float(scores[second_index]) if second_index != index else 0.0
    confidence_gap = confidence - second_confidence

    # Basic plant-presence signal from color statistics.
    # Include diseased yellow/brown leaf tones so dry or infected leaves are not rejected.
    hsv = tf.image.rgb_to_hsv(rgb).numpy()
    green_mask = (
        (hsv[..., 0] >= 0.18)
        & (hsv[..., 0] <= 0.45)
        & (hsv[..., 1] >= 0.15)
        & (hsv[..., 2] >= 0.12)
    )
    green_ratio = float(np.mean(green_mask))

    yellow_mask = (
        (hsv[..., 0] >= 0.08)
        & (hsv[..., 0] <= 0.18)
        & (hsv[..., 1] >= 0.18)
        & (hsv[..., 2] >= 0.18)
    )
    brown_mask = (
        ((hsv[..., 0] >= 0.04) & (hsv[..., 0] <= 0.12))
        & (hsv[..., 1] >= 0.25)
        & (hsv[..., 2] >= 0.08)
        & (hsv[..., 2] <= 0.75)
    )
    diseased_ratio = float(np.mean(yellow_mask | brown_mask))

    exg = (2.0 * rgb[..., 1]) - rgb[..., 0] - rgb[..., 2]
    vegetation_ratio = float(np.mean(exg > 0.08))
    has_plant_like_pixels = (
        green_ratio >= MIN_GREEN_RATIO
        or vegetation_ratio >= MIN_VEGETATION_RATIO
        or diseased_ratio >= MIN_DISEASED_RATIO
    )

    is_confident_prediction = (
        confidence >= MIN_PLANT_CONFIDENCE and confidence_gap >= MIN_CONFIDENCE_GAP
    )
    is_valid_crop = (
        (is_confident_prediction and has_plant_like_pixels)
        or confidence >= HIGH_CONFIDENCE_OVERRIDE
        or (confidence >= MODEL_CONFIDENCE_OVERRIDE and confidence_gap >= MIN_CONFIDENCE_GAP)
    )
    advice = METADATA["advice_map"].get(
        raw_label,
        "Inspect nearby plants and follow crop-specific disease management guidance.",
    )

    return {
        "raw_label": raw_label,
        "label": label,
        "confidence": confidence,
        "second_confidence": second_confidence,
        "confidence_gap": confidence_gap,
        "green_ratio": green_ratio,
        "vegetation_ratio": vegetation_ratio,
        "diseased_ratio": diseased_ratio,
        "advice": advice,
        "is_valid_crop_image": is_valid_crop,
        "validation_message": (
            ""
            if is_valid_crop
            else "Upload a clearer crop, leaf, or fruit image. Human or unrelated images are not allowed."
        ),
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python analyze_model.py <image_path>"}))
        sys.exit(1)

    target_image = sys.argv[1]

    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        print(
            json.dumps(
                {
                    "error": "Trained model not found. Run ml/src/train_classifier.py first."
                }
            )
        )
        sys.exit(1)

    result = predict_image(target_image)
    print(json.dumps(result))
