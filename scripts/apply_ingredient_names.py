
import json
from pathlib import Path
from collections import Counter

from normalize_ingredient_names import normalize_ingredient_name

INPUT = Path("data/processed/recipenlg_normalized.json")
OUTPUT = Path("data/processed/recipenlg_canonical.json")
REPORT = Path("data/processed/canonical_report.json")


def main():
    with INPUT.open(encoding="utf-8") as f:
        recipes = json.load(f)

    before = set()
    after = set()
    changes = Counter()
    total = 0

    for recipe in recipes:
        for ingredient in recipe["normalized_ingredients"]:
            original_name = ingredient["ingredient_name"]
            result = normalize_ingredient_name(original_name)

            ingredient["canonical_name"] = result["canonical_name"]
            ingredient["preparation"] = result["preparation"]

            before.add(original_name.strip().lower())
            after.add(result["canonical_name"])
            total += 1

            if original_name.strip().lower() != result["canonical_name"]:
                changes[
                    (original_name.strip().lower(), result["canonical_name"])
                ] += 1

    report = {
        "total_recipes": len(recipes),
        "total_ingredients": total,
        "unique_names_before": len(before),
        "unique_names_after": len(after),
        "changed_occurrences": sum(changes.values()),
        "top_changes": [
            {
                "from": source,
                "to": target,
                "count": count,
            }
            for (source, target), count in changes.most_common(30)
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT.write_text(
        json.dumps(recipes, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    REPORT.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("===== CANONICAL NAME REPORT =====")
    print("Recipes:", report["total_recipes"])
    print("Ingredients:", report["total_ingredients"])
    print("Unique names before:", report["unique_names_before"])
    print("Unique names after:", report["unique_names_after"])
    print("Changed occurrences:", report["changed_occurrences"])

    print("\n===== TOP 15 CHANGES =====")
    for item in report["top_changes"][:15]:
        print(
            f"{item['count']:4} | "
            f"{item['from']} -> {item['to']}"
        )

    print("\nOutput:", OUTPUT)
    print("Report:", REPORT)


if __name__ == "__main__":
    main()
