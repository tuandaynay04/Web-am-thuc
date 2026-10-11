import csv
import json
from pathlib import Path

input_path = Path("data/raw/recipenlg_sample.csv")
output_path = Path("data/processed/recipenlg_100_sample.json")

recipes = []

with input_path.open(encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    for row in reader:
        if len(recipes) >= 100:
            break

        try:
            ingredients = json.loads(row["ingredients"])
            directions = json.loads(row["directions"])
            ner = json.loads(row["NER"])
        except (ValueError, TypeError, KeyError):
            continue

        if not row["title"] or not ingredients or not directions:
            continue

        recipes.append({
            "title": row["title"],
            "ingredients": ingredients,
            "directions": directions,
            "ner": ner,
            "link": row["link"],
            "source": row["source"],
        })

output_path.parent.mkdir(parents=True, exist_ok=True)

with output_path.open("w", encoding="utf-8") as file:
    json.dump(recipes, file, ensure_ascii=False, indent=2)

print(f"Số công thức hợp lệ: {len(recipes)}")
print(f"Đã lưu: {output_path}")
