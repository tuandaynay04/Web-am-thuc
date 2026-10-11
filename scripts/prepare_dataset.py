
import csv
import json
import hashlib
from pathlib import Path

INPUT_FILE = Path("data/raw/recipenlg_sample.csv")
OUTPUT_FILE = Path("data/processed/recipenlg_dataset.json")
REPORT_FILE = Path("data/processed/dataset_report.json")

TARGET_RECIPES = 1000


def parse_list(value):
    result = json.loads(value)
    if not isinstance(result, list):
        raise ValueError("Expected a list")
    return result


def recipe_key(title, ingredients):
    content = json.dumps(
        [title.strip().casefold(), ingredients],
        ensure_ascii=False,
        sort_keys=True,
    )
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def prepare_dataset():
    recipes = []
    seen = set()

    stats = {
        "target": TARGET_RECIPES,
        "total_rows_read": 0,
        "invalid_rows": 0,
        "duplicate_rows": 0,
        "accepted_rows": 0,
    }

    with INPUT_FILE.open(
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        required = {
            "title",
            "ingredients",
            "directions",
            "link",
            "source",
            "NER",
        }

        if not required.issubset(reader.fieldnames or []):
            raise ValueError("CSV thiếu các cột bắt buộc")

        for row in reader:
            if len(recipes) >= TARGET_RECIPES:
                break

            stats["total_rows_read"] += 1

            try:
                title = row["title"].strip()
                ingredients = parse_list(row["ingredients"])
                directions = parse_list(row["directions"])
                ner = parse_list(row["NER"])

                if (
                    not title
                    or not ingredients
                    or not directions
                    or not all(
                        isinstance(x, str) and x.strip()
                        for x in ingredients + directions
                    )
                ):
                    raise ValueError("Missing required content")

            except (ValueError, TypeError, KeyError):
                stats["invalid_rows"] += 1
                continue

            key = recipe_key(title, ingredients)

            if key in seen:
                stats["duplicate_rows"] += 1
                continue

            seen.add(key)

            recipes.append({
                "source_row_id": row.get("", ""),
                "title": title,
                "ingredients": ingredients,
                "directions": directions,
                "ner": ner,
                "link": row["link"],
                "source": row["source"],
                "dataset": "RecipeNLG",
            })

    stats["accepted_rows"] = len(recipes)
    stats["target_reached"] = len(recipes) >= TARGET_RECIPES

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(recipes, file, ensure_ascii=False, indent=2)

    with REPORT_FILE.open("w", encoding="utf-8") as file:
        json.dump(stats, file, ensure_ascii=False, indent=2)

    print("===== DATASET REPORT =====")
    for key, value in stats.items():
        print(f"{key}: {value}")

    print(f"\nDữ liệu: {OUTPUT_FILE}")
    print(f"Báo cáo: {REPORT_FILE}")


if __name__ == "__main__":
    prepare_dataset()
