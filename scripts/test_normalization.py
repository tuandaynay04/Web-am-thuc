
import unittest
from normalize_ingredients import normalize_ingredient


class TestNormalization(unittest.TestCase):

    def test_01_weight(self):
        r = normalize_ingredient("1 kg beef")
        self.assertEqual(r["ingredient_name"], "beef")
        self.assertEqual(r["quantity_standard"], 1000)
        self.assertEqual(r["unit_standard"], "g")

    def test_02_volume(self):
        r = normalize_ingredient("250 ml milk")
        self.assertEqual(r["quantity_standard"], 250)
        self.assertEqual(r["unit_standard"], "ml")

    def test_03_cooking_unit(self):
        r = normalize_ingredient("1/2 tsp. salt")
        self.assertEqual(r["quantity"], 0.5)
        self.assertEqual(r["unit"], "teaspoon")

    def test_04_package(self):
        r = normalize_ingredient("2 (16 oz.) pkg. frozen corn")
        self.assertEqual(r["unit"], "package")
        self.assertAlmostEqual(
            r["quantity_standard"], 907.18, places=2
        )

    def test_05_count(self):
        r = normalize_ingredient("4 boned chicken breasts")
        self.assertEqual(r["quantity"], 4)
        self.assertEqual(r["normalization_status"], "VALID_COUNT")

    def test_06_size(self):
        r = normalize_ingredient("1 large whole chicken")
        self.assertEqual(r["size"], "large")
        self.assertEqual(r["ingredient_name"], "whole chicken")

    def test_07_modifier(self):
        r = normalize_ingredient("3 level tsp. soda")
        self.assertEqual(r["quantity"], 3)
        self.assertEqual(r["unit"], "teaspoon")
        self.assertEqual(r["quantity_modifier"], "level")

    def test_08_dash(self):
        r = normalize_ingredient("dash of vanilla")
        self.assertEqual(r["ingredient_name"], "vanilla")
        self.assertEqual(r["unit"], "dash")
        self.assertEqual(
            r["normalization_status"], "QUALITATIVE_QUANTITY"
        )

    def test_09_no_quantity(self):
        r = normalize_ingredient("pepper to taste")
        self.assertIsNone(r["quantity"])
        self.assertEqual(r["normalization_status"], "NO_QUANTITY")

    def test_10_quart(self):
        r = normalize_ingredient("1 qt. cleaned strawberries")
        self.assertEqual(r["unit"], "quart")
        self.assertIsNone(r["quantity_standard"])

    def test_11_pint(self):
        r = normalize_ingredient("1 pt. sour cream")
        self.assertEqual(r["unit"], "pint")
        self.assertIsNone(r["quantity_standard"])

    def test_12_original_preserved(self):
        text = "1 large whole chicken"
        r = normalize_ingredient(text)
        self.assertEqual(r["original_text"], text)

    
    def test_hyphenated_package_weight_needs_review(self):
        result = normalize_ingredient(
            "1-8 oz pkg. cream cheese, softened"
        )
        self.assertEqual(
            result["normalization_status"],
            "NEEDS_REVIEW"
        )

    def test_trailing_package_weight_not_in_name(self):
        result = normalize_ingredient(
            "4 pkg. (8 oz.) cream cheese"
        )
        self.assertEqual(
            result["ingredient_name"],
            "cream cheese"
        )
        self.assertEqual(result["quantity"], 4.0)
        self.assertEqual(result["unit"], "package")

    def test_compound_package_quantity_needs_review(self):
        result = normalize_ingredient(
            "1 large and 1 small pkg. cream cheese"
        )
        self.assertEqual(
            result["normalization_status"],
            "NEEDS_REVIEW"
        )
    
    def test_weight_followed_by_package_unit(self):
        result = normalize_ingredient(
            "10 oz. pkg. frozen chopped broccoli"
        )
        self.assertEqual(
            result["ingredient_name"],
            "frozen chopped broccoli"
        )
        self.assertEqual(result["quantity_standard"], 283.5)
        self.assertEqual(result["unit_standard"], "g")

    def test_secondary_measurement_preserved(self):
        result = normalize_ingredient(
            "1 lb. (3 1/2 c.) powdered sugar"
        )
        self.assertEqual(
            result["ingredient_name"],
            "powdered sugar"
        )
        self.assertEqual(
            result["secondary_measurement"],
            "3 1/2 c."
        )

    def test_cut_size_not_treated_as_weight(self):
        result = normalize_ingredient(
            "2 Tbsp. sliced (1/4-inch) green onion"
        )
        self.assertEqual(result["ingredient_name"], "sliced green onion")
        self.assertEqual(result["cut_size"], "1/4-inch")

    def test_large_can_with_weight(self):
        result = normalize_ingredient(
            "1 large (28 oz.) can Bush's beans"
        )
        self.assertEqual(result["ingredient_name"], "Bush's beans")
        self.assertEqual(result["quantity"], 1.0)
        self.assertEqual(result["unit"], "can")
        self.assertEqual(result["size"], "large")
        self.assertEqual(result["package_detail"], "28 oz")

    def test_small_package_with_weight(self):
        result = normalize_ingredient(
            "1 small (3 oz.) pkg. lemon jello"
        )
        self.assertEqual(result["ingredient_name"], "lemon jello")
        self.assertEqual(result["quantity"], 1.0)
        self.assertEqual(result["unit"], "package")
        self.assertEqual(result["size"], "small")
        self.assertEqual(result["package_detail"], "3 oz")


if __name__ == "__main__":
    unittest.main()
