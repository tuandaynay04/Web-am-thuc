
import csv
import json
from pathlib import Path

INPUT = Path("data/processed/recipenlg_normalized.json")
OUTPUT = Path("data/processed/ingredients_review.csv")

REVIEW_STATUSES = {
    "COUNT_OR_UNKNOWN_UNIT",
    "NO_QUANTITY",
}

with INPUT.open(encoding="utf-8") as file:
    recipes = json.load(file)

rows = []

for recipe_index, recipe in enumerate(recipes):
    for ingredient_index, ingredient in enumerate(
        recipe["normalized_ingredients"]
    ):
        status = ingredient["normalization_status"]

        if status not in REVIEW_STATUSES:
            continue

        rows.append({
            "recipe_index": recipe_index,
            "ingredient_index": ingredient_index,
            "recipe_title": recipe["title"],
            "original_text": ingredient["original_text"],
            "ingredient_name": ingredient["ingredient_name"],
            "quantity": ingredient["quantity"],
            "unit": ingredient["unit"],
            "status": status,
        })

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

with OUTPUT.open(
    "w",
    encoding="utf-8-sig",
    newline="",
) as file:
    writer = csv.DictWriter(
        file,
        fieldnames=[
            "recipe_index",
            "ingredient_index",
            "recipe_title",
            "original_text",
            "ingredient_name",
            "quantity",
            "unit",
            "status",
        ],
    )

    writer.writeheader()
    writer.writerows(rows)

print("===== REVIEW EXPORT =====")
print("Rows exported:", len(rows))
print("Output:", OUTPUT)
