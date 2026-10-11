
import re

# Các cách viết đã xác nhận là tương đương
ALIASES = {
    "eggs": "egg",
    "green peppers": "green pepper",
    "bananas": "banana",
    "onions": "onion",
    "potatoes": "potato",
    "tomatoes": "tomato",
}

# Chỉ tách các từ mô tả cách sơ chế rõ ràng
PREPARATION_WORDS = {
    "chopped",
    "diced",
    "sliced",
    "minced",
    "beaten",
}

def normalize_ingredient_name(name):
    original_name = name.strip()
    text = re.sub(r"\s+", " ", original_name.lower())

    preparation = []

    # Ví dụ: "onion, chopped"
    parts = [p.strip() for p in text.split(",")]
    base = parts[0]

    for part in parts[1:]:
        if part in PREPARATION_WORDS:
            preparation.append(part)
        else:
            # Không tự ý loại bỏ mô tả chưa hiểu
            base += ", " + part

    # Ví dụ: "chopped onion"
    words = base.split()

    while words and words[0] in PREPARATION_WORDS:
        preparation.append(words.pop(0))

    base = " ".join(words)

    # Chỉ dùng ánh xạ đã khai báo
    canonical_name = ALIASES.get(base, base)

    return {
        "original_name": original_name,
        "canonical_name": canonical_name,
        "preparation": list(dict.fromkeys(preparation)),
    }


if __name__ == "__main__":
    examples = [
        "eggs",
        "egg",
        "egg, beaten",
        "chopped onion",
        "onion, chopped",
        "green peppers, diced",
        "ripe bananas",
        "brown sugar",
        "baking soda",
        "ground beef",
    ]

    for example in examples:
        result = normalize_ingredient_name(example)
        print(
            f"{example} => "
            f"{result['canonical_name']} | "
            f"preparation={result['preparation']}"
        )
