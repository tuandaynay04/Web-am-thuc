
import re
from fractions import Fraction

# Đơn vị có thể quy đổi chính xác
CONVERSIONS = {
    "g": ("g", 1),
    "gram": ("g", 1),
    "grams": ("g", 1),
    "kg": ("g", 1000),
    "oz": ("g", 28.349523125),
    "lb": ("g", 453.59237),
    "lbs": ("g", 453.59237),
    "ml": ("ml", 1),
    "l": ("ml", 1000),
    "liter": ("ml", 1000),
    "liters": ("ml", 1000),
    "litre": ("ml", 1000),
    "litres": ("ml", 1000),
    "fl oz": ("ml", 29.5735295625),
    
}

# Đơn vị nấu ăn giữ nguyên

COOKING_UNITS = {
    # Cốc
    "c": "cup",
    "cup": "cup",
    "cups": "cup",

    # Thìa cà phê
    "tsp": "teaspoon",
    "teaspoon": "teaspoon",
    "teaspoons": "teaspoon",

    # Thìa canh
    "tbsp": "tablespoon",
    "tablespoon": "tablespoon",
    "tablespoons": "tablespoon",

    # Đơn vị thể tích trong công thức Mỹ
    "qt": "quart",
    "quart": "quart",
    "quarts": "quart",

    "pt": "pint",
    "pint": "pint",
    "pints": "pint",

    # Lượng nhỏ, không xác định chính xác
    "dash": "dash",
    "pinch": "pinch",
}


# Đơn vị đóng gói
PACKAGE_UNITS = {
    "can": "can",
    "cans": "can",
    "pkg": "package",
    "package": "package",
    "packages": "package",
    "jar": "jar",
    "carton": "carton",
    "box": "box",
    "bottle": "bottle",
    "container": "container",
"containers": "container",
}


ALL_UNITS = {
    **{unit: unit for unit in CONVERSIONS},
    **COOKING_UNITS,
    **PACKAGE_UNITS,
}


SIZE_WORDS = {
    "small", "medium", "large",
    "extra-large", "jumbo",
}

NUMBER = r"\d+(?:\.\d+)?(?:/\d+)?"
QUANTITY = rf"{NUMBER}(?:\s+{NUMBER})?"

UNIT_PATTERN = "|".join(
    re.escape(unit)
    for unit in sorted(ALL_UNITS, key=len, reverse=True)
)


def parse_number(text):
    return float(
        sum(Fraction(part) for part in text.split())
    )


def convert_quantity(quantity, unit):
    if quantity is None or unit not in CONVERSIONS:
        return None, None

    standard_unit, factor = CONVERSIONS[unit]

    return round(quantity * factor, 2), standard_unit



def normalize_ingredient(text):
    original = text.strip()
    remaining = original

    quantity = None
    unit = None
    size = None
    package_detail = None
    quantity_modifier = None
    secondary_measurement = None
    cut_size = None
    needs_review = False
    # Định lượng đóng gói viết không rõ ràng
    if re.match(
        r"^\d+\s*-\s*\d+\s*(?:fl\s+oz|oz|g|kg|lb|ml|l)\b",
        remaining,
        flags=re.IGNORECASE,
    ):
        needs_review = True

    # Nhiều kích thước đóng gói trong cùng một dòng
    if re.match(
        r"^\d+\s+(?:small|medium|large)\s+and\s+"
        r"\d+\s+(?:small|medium|large)\b",
        remaining,
        flags=re.IGNORECASE,
    ):
        needs_review = True
    # 1. Nhận diện số lượng đầu dòng
    match = re.match(
        rf"^({QUANTITY})(?=\s|$)",
        remaining,
    )

    if match:
        quantity = parse_number(match.group(1))
        remaining = remaining[match.end():].strip()

    # 2. Nhận diện lượng định tính không có số
    # Ví dụ: dash of vanilla, pinch of salt
    if quantity is None:
        qualitative_match = re.match(
            r"^(dash|pinch)\s+of\s+(.+)$",
            remaining,
            flags=re.IGNORECASE,
        )

        if qualitative_match:
            unit = qualitative_match.group(1).lower()
            remaining = qualitative_match.group(2).strip()

    # 3. Nhận diện thông tin bao bì
    package_match = re.match(
        r"^\(([^)]+)\)\s*",
        remaining,
    )

    if package_match:
        package_detail = package_match.group(1)
        remaining = remaining[package_match.end():].strip()

    # 4. Nhận diện kích thước
    size_match = re.match(
        r"^(extra-large|small|medium|large|jumbo)\s+",
        remaining,
        flags=re.IGNORECASE,
    )

    if size_match:
        size = size_match.group(1).lower()
        remaining = remaining[size_match.end():].strip()
        # Trọng lượng đóng gói nằm sau kích thước
    # Ví dụ: 1 large (28 oz.) can Bush's beans
    if size is not None and package_detail is None:
        sized_package_match = re.match(
            rf"^\(\s*({QUANTITY})\s*"
            rf"(fl\s+oz|kg|g|oz|lb|ml|l)\.?\s*\)\s*"
            rf"(?=(?:can|cans|pkg|package|packages|jar|box|bottle|carton|container|containers)\b)",
            remaining,
            flags=re.IGNORECASE,
        )

        if sized_package_match:
            package_detail = (
                f"{sized_package_match.group(1)} "
                f"{sized_package_match.group(2)}"
            )
            remaining = remaining[sized_package_match.end():].strip()
    # 5. Nhận diện mô tả định lượng trước đơn vị
    # Ví dụ: 3 level tsp. soda
    modifier_match = re.match(
        r"^(level|heaping|rounded)\s+",
        remaining,
        flags=re.IGNORECASE,
    )

    if modifier_match:
        quantity_modifier = modifier_match.group(1).lower()
        remaining = remaining[modifier_match.end():].strip()

    # 6. Nhận diện đơn vị
    if unit is None:
        unit_match = re.match(
            rf"^({UNIT_PATTERN})\.?(?=\s|$)",
            remaining,
            flags=re.IGNORECASE,
        )

        if unit_match:
            raw_unit = unit_match.group(1).lower()
            unit = ALL_UNITS[raw_unit]
            remaining = remaining[unit_match.end():].strip()
    # Trọng lượng bao bì nằm sau đơn vị
    # Ví dụ: 4 pkg. (8 oz.) cream cheese
    if unit in PACKAGE_UNITS.values() and package_detail is None:
        trailing_package = re.match(
            rf"^\(\s*({QUANTITY})\s*"
            rf"(fl\s+oz|kg|g|oz|lb|ml|l)\.?\s*\)\s*",
            remaining,
            flags=re.IGNORECASE,
        )

        if trailing_package:
            package_detail = (
                f"{trailing_package.group(1)} "
                f"{trailing_package.group(2)}"
            )
            remaining = remaining[trailing_package.end():].strip()
        # Đơn vị đóng gói theo sau trọng lượng
    # Ví dụ: 10 oz. pkg. frozen broccoli
    if unit in {"g", "gram", "grams", "kg", "oz", "lb", "lbs"}:
        remaining = re.sub(
            r"^(?:pkg|package|packages)\.?\s+",
            "",
            remaining,
            flags=re.IGNORECASE,
        ).strip()

    # Định lượng phụ: 1 lb. (3 1/2 c.) powdered sugar
    secondary_match = re.match(
        rf"^\(\s*({QUANTITY})\s*"
        rf"(c|cups?|tsp|tbsp|oz|g|kg|lb|ml|l)\.?\s*\)\s*",
        remaining,
        flags=re.IGNORECASE,
    )

    if secondary_match:
        secondary_measurement = (
            f"{secondary_match.group(1)} "
            f"{secondary_match.group(2)}."
        )
        remaining = remaining[secondary_match.end():].strip()

    # Kích thước cắt: sliced (1/4-inch) green onion
    cut_match = re.search(
        r"\(\s*(\d+(?:/\d+)?\s*-\s*inch)\s*\)",
        remaining,
        flags=re.IGNORECASE,
    )

    if cut_match:
        cut_size = cut_match.group(1)
        remaining = (
            remaining[:cut_match.start()]
            + remaining[cut_match.end():]
        )
        remaining = re.sub(r"\s+", " ", remaining).strip()
    # 7. Giữ kích thước riêng cho mọi nguyên liệu
    # Ví dụ: 1 large whole chicken
    # quantity=1, size=large, name=whole chicken

    # Nếu modifier không đi cùng đơn vị,
    # trả modifier về tên để tránh mất dữ liệu
    if quantity_modifier and unit is None:
        remaining = f"{quantity_modifier} {remaining}".strip()
        quantity_modifier = None

    # 8. Loại bỏ "of" sau đơn vị định tính
    if unit in {"dash", "pinch"}:
        remaining = re.sub(
            r"^of\s+",
            "",
            remaining,
            flags=re.IGNORECASE,
        ).strip()

    # 9. Nhận diện nguyên liệu tùy chọn
    optional = bool(
        re.search(r"\(optional\)", remaining, re.IGNORECASE)
    )

    remaining = re.sub(
        r"\s*\(optional\)",
        "",
        remaining,
        flags=re.IGNORECASE,
    ).strip()

    # 10. Quy đổi chính xác sang g/ml
    standard_quantity, standard_unit = convert_quantity(
        quantity, unit
    )

    # 11. Quy đổi trọng lượng ghi trên bao bì
    if package_detail and quantity is not None:
        package_weight_match = re.fullmatch(
            rf"\s*({QUANTITY})\s*"
            rf"(fl\s+oz|kg|g|oz|lb|ml|l)\.?\s*",
            package_detail,
            flags=re.IGNORECASE,
        )

        if package_weight_match:
            package_quantity = parse_number(
                package_weight_match.group(1)
            )
            package_unit = re.sub(
                r"\s+", " ",
                package_weight_match.group(2).lower(),
            )

            standard_quantity, standard_unit = convert_quantity(
                quantity * package_quantity,
                package_unit,
            )

    # 12. Phân loại trạng thái
    if needs_review:
        status = "NEEDS_REVIEW"
    elif standard_quantity is not None:
        status = "STANDARDIZED"
    elif quantity is not None and unit in COOKING_UNITS.values():
        status = "VALID_COOKING_UNIT"
    elif quantity is not None and unit in PACKAGE_UNITS.values():
        status = "VALID_PACKAGE_UNIT"
    elif quantity is not None and unit is None:
        status = "VALID_COUNT"
    elif quantity is None and unit in {"dash", "pinch"}:
        status = "QUALITATIVE_QUANTITY"
    elif quantity is None:
        status = "NO_QUANTITY"
    else:
        status = "NEEDS_REVIEW"

    return {
        "original_text": original,
        "ingredient_name": remaining,
        "quantity": quantity,
        "unit": unit,
        "size": size,
        "quantity_modifier": quantity_modifier,
        "package_detail": package_detail,
        "secondary_measurement": secondary_measurement,
        "cut_size": cut_size,
        "quantity_standard": standard_quantity,
        "unit_standard": standard_unit,
        "optional": optional,
        "normalization_status": status,
    }



if __name__ == "__main__":
    examples = [
        "500 g chicken",
        "1 kg beef",
        "250 ml milk",
        "1/2 tsp. salt",
        "2 Tbsp. butter",
        "3 1/2 c. flour",
        "1 small jar chipped beef",
        "1 large pkg. chocolate chips",
        "2 (16 oz.) pkg. frozen corn",
        "4 boned chicken breasts",
        "pepper to taste",
        "1 qt. cleaned strawberries",
            "1 pt. sour cream",
            "dash of vanilla",
    ]

    for example in examples:
        result = normalize_ingredient(example)

        print("\n", example)
        print("Tên:", result["ingredient_name"])
        print("Số lượng:", result["quantity"])
        print("Đơn vị:", result["unit"])
        print("Kích thước:", result["size"])
        print("Chuẩn:", result["quantity_standard"], result["unit_standard"])
        print("Trạng thái:", result["normalization_status"])
