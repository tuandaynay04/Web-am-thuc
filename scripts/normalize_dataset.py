
import json
from pathlib import Path
from collections import Counter

from normalize_ingredients import normalize_ingredient

INPUT_FILE = Path("data/processed/recipenlg_dataset.json")
OUTPUT_FILE = Path("data/processed/recipenlg_normalized.json")
REPORT_FILE = Path("data/processed/normalization_report.json")


def main():
    with INPUT_FILE.open(encoding="utf-8") as file:
        recipes = json.load(file)

    normalized_recipes = []
    status_counter = Counter()
    unit_counter = Counter()
    total_ingredients = 0

    for recipe in recipes:
        normalized_ingredients = []

        for raw_ingredient in recipe["ingredients"]:
            ingredient = normalize_ingredient(raw_ingredient)

            normalized_ingredients.append(ingredient)
            total_ingredients += 1

            status_counter[
                ingredient["normalization_status"]
            ] += 1

            if ingredient["unit"]:
                unit_counter[ingredient["unit"]] += 1

        normalized_recipes.append({
            **recipe,
            "normalized_ingredients": normalized_ingredients,
        })

    report = {
        "total_recipes": len(normalized_recipes),
        "total_ingredients": total_ingredients,
        "status_counts": dict(status_counter),
        "units_found": dict(unit_counter.most_common()),
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT_FILE.write_text(
        json.dumps(
            normalized_recipes,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    REPORT_FILE.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print("===== NORMALIZATION V3 REPORT =====")
    print("Total recipes:", report["total_recipes"])
    print("Total ingredients:", report["total_ingredients"])

    for status, count in status_counter.most_common():
        percentage = (
            count / total_ingredients * 100
            if total_ingredients else 0
        )
        print(f"{status}: {count} ({percentage:.2f}%)")

    print("\nOutput:", OUTPUT_FILE)
    print("Report:", REPORT_FILE)


if __name__ == "__main__":
    main()
