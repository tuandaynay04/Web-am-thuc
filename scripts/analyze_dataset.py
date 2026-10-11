
import json
from collections import Counter
from pathlib import Path

DATA_PATH = Path("data/processed/recipenlg_100_sample.json")


def analyze_dataset():
    with DATA_PATH.open(encoding="utf-8") as file:
        recipes = json.load(file)

    if not recipes:
        print("Không có dữ liệu để phân tích.")
        return

    titles = [
        recipe["title"].strip().lower()
        for recipe in recipes
    ]

    title_counts = Counter(titles)
    duplicates = sum(
        count - 1
        for count in title_counts.values()
        if count > 1
    )

    ingredient_counts = [
        len(recipe["ingredients"])
        for recipe in recipes
    ]

    print("===== THỐNG KÊ RECIPENLG =====")
    print("Tổng công thức:", len(recipes))
    print("Tên món trùng:", duplicates)
    print(
        "Thiếu nguyên liệu:",
        sum(not r["ingredients"] for r in recipes),
    )
    print(
        "Thiếu hướng dẫn:",
        sum(not r["directions"] for r in recipes),
    )
    print(
        "Số nguyên liệu trung bình:",
        round(sum(ingredient_counts) / len(recipes), 2),
    )
    print("Ít nguyên liệu nhất:", min(ingredient_counts))
    print("Nhiều nguyên liệu nhất:", max(ingredient_counts))

    print("\n===== 5 MÓN ĐẦU TIÊN =====")
    for recipe in recipes[:5]:
        print(
            f"- {recipe['title']}: "
            f"{len(recipe['ingredients'])} nguyên liệu"
        )


if __name__ == "__main__":
    analyze_dataset()
