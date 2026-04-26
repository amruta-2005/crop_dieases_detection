import argparse
import json
import os
import random
from datetime import datetime
from pathlib import Path

import numpy as np
import tensorflow as tf


def set_seed(seed: int) -> None:
    os.environ["PYTHONHASHSEED"] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def prettify_label(raw_label: str) -> str:
    cleaned = raw_label.replace("___", " - ").replace("_", " ")
    cleaned = " ".join(cleaned.split())
    return cleaned


def build_advice(raw_label: str) -> str:
    label = raw_label.lower()
    if "healthy" in label:
        return "The plant appears healthy. Keep monitoring leaf moisture, airflow, and field hygiene."
    if "blight" in label:
        return "Remove infected leaves, avoid leaf wetness, and apply a crop-safe fungicide recommended locally."
    if "rust" in label:
        return "Inspect nearby plants, improve airflow, and use a recommended fungicide if symptoms keep spreading."
    if "mildew" in label:
        return "Reduce humidity around the crop, prune dense foliage, and use a suitable treatment for mildew."
    if "spot" in label or "speck" in label:
        return "Remove infected plant material, avoid overhead irrigation, and disinfect tools after field work."
    if "scab" in label:
        return "Use clean planting material, improve sanitation, and follow local scab-control recommendations."
    if "mosaic" in label or "virus" in label:
        return "Isolate affected plants, control insect vectors, and avoid reusing infected plant material."
    return "Inspect nearby plants, remove badly affected leaves, and follow crop-specific guidance from local experts."


def build_model(image_size: int, class_count: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(image_size, image_size, 3), name="image")

    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.08),
            tf.keras.layers.RandomZoom(0.12),
            tf.keras.layers.RandomContrast(0.1),
        ],
        name="augmentation",
    )

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(image_size, image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    x = augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(class_count, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="plant_disease_classifier")
    return model


def unfreeze_for_finetuning(model: tf.keras.Model, trainable_tail_layers: int = 40) -> None:
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) and layer.name.startswith("mobilenetv2_"):
            base_model = layer
            break

    if base_model is None:
        return

    base_model.trainable = True
    for layer in base_model.layers[:-trainable_tail_layers]:
        layer.trainable = False


def save_metadata(class_names, image_size: int, output_path: Path) -> None:
    metadata = {
        "image_size": image_size,
        "class_names": list(class_names),
        "display_names": {name: prettify_label(name) for name in class_names},
        "advice_map": {name: build_advice(name) for name in class_names},
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
    output_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train PlantVillage disease classifier")
    parser.add_argument("--data-dir", default="ml/dataset/raw/PlantVillage")
    parser.add_argument("--output-model", dest="output_model", default="ml/artifacts/plant_disease_classifier.keras")
    parser.add_argument("--output-metadata", dest="output_metadata", default="ml/artifacts/class_names.json")
    parser.add_argument("--history-path", default="ml/artifacts/training_history.json")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--image-size", type=int, default=160)
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--fine-tune-epochs", type=int, default=2)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)

    data_dir = Path(args.data_dir)
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"
    artifacts_dir = Path(args.output_model).parent
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    if not train_dir.exists() or not val_dir.exists():
        raise FileNotFoundError(f"Expected train/ and val/ under {data_dir}")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        label_mode="categorical",
        image_size=(args.image_size, args.image_size),
        batch_size=args.batch_size,
        shuffle=True,
        seed=args.seed,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        label_mode="categorical",
        image_size=(args.image_size, args.image_size),
        batch_size=args.batch_size,
        shuffle=False,
    )

    class_names = train_ds.class_names
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=autotune)
    val_ds = val_ds.prefetch(buffer_size=autotune)

    save_metadata(class_names, args.image_size, Path(args.output_metadata))

    model = build_model(args.image_size, len(class_names))
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=["accuracy"],
    )

    checkpoint_path = artifacts_dir / "best_plant_disease_classifier.keras"
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=2, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=1, verbose=1),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
    ]

    print("Starting base training...")
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, callbacks=callbacks)

    if args.fine_tune_epochs > 0:
        print("Starting fine-tuning...")
        unfreeze_for_finetuning(model)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
            loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
            metrics=["accuracy"],
        )
        fine_history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.fine_tune_epochs,
            callbacks=callbacks,
        )
        for key, values in fine_history.history.items():
            history.history.setdefault(key, []).extend(values)

    val_loss, val_accuracy = model.evaluate(val_ds, verbose=1)
    model.save(args.output_model)

    history_payload = {
        "history": history.history,
        "final_val_loss": float(val_loss),
        "final_val_accuracy": float(val_accuracy),
        "class_count": len(class_names),
        "class_names": class_names,
    }
    Path(args.history_path).write_text(json.dumps(history_payload, indent=2), encoding="utf-8")

    print(f"Saved model to: {args.output_model}")
    print(f"Saved metadata to: {args.output_metadata}")
    print(f"Validation accuracy: {val_accuracy:.4f}")


if __name__ == "__main__":
    main()
