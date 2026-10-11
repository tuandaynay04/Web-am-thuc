
import json
from pathlib import Path

DATA_PATH = Path("data/processed/recipenlg_100_sample.json")

with DATA_PATH.open(encoding="utf-8") as file:
    recipes = json.load(file)

print("===== 50 NGUYÊN LIỆU ĐẦU TIÊN =====")

count = 0

for recipe in recipes:
    for ingredient in recipe["ingredients"]:
        print(f"{count + 1:02d}. {ingredient}")
        count += 1

        if count >= 50:
            break

    if count >= 50:
        break
