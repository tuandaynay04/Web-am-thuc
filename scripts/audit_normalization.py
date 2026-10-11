
import json
from pathlib import Path
from collections import Counter

INPUT = Path("data/processed/recipenlg_normalized.json")
OUTPUT = Path("data/processed/normalization_audit.json")

with INPUT.open(encoding="utf-8") as f:
    recipes = json.load(f)

groups = Counter()
examples = {}
unrecognized = []

for recipe in recipes:
    for item in recipe["normalized_ingredients"]:
        if item["conversion_status"] == "CONVERTED":
            continue

        unit = item.get("unit")
        quantity = item.get("quantity")
        name = item.get("ingredient_name", "")

        if unit in {"cup", "teaspoon", "tablespoon"}:
            group = "VOLUME_NEEDS_DENSITY"
        elif unit in {
            "can", "package", "box", "jar",
            "bottle", "carton"
        }:
            group = "PACKAGE_NEEDS_WEIGHT"
        elif quantity is not None and unit is None:
            group = "COUNT_OR_UNKNOWN_UNIT"
        else:
            group = "UNPARSED_OR_NO_QUANTITY"

        groups[group] += 1

        if len(examples.get(group, [])) < 10:
            examples.setdefault(group, []).append(
                item["original_text"]
            )

        if not name:
            unrecognized.append(item["original_text"])

report = {
    "groups": dict(groups),
    "examples": examples,
    "empty_ingredient_names": unrecognized[:30]
}

OUTPUT.write_text(
    json.dumps(report, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("===== NORMALIZATION AUDIT =====")
for group, count in groups.most_common():
    print(f"\n{group}: {count}")
    for example in examples.get(group, [])[:5]:
        print("  -", example)

print("\nEmpty ingredient names:", len(unrecognized))
print("Report:", OUTPUT)
