
import unittest

from normalize_ingredient_names import normalize_ingredient_name


class TestIngredientNames(unittest.TestCase):

    def test_plural_eggs(self):
        self.assertEqual(
            normalize_ingredient_name("eggs")["canonical_name"],
            "egg"
        )

    def test_chopped_onion(self):
        result = normalize_ingredient_name("chopped onion")
        self.assertEqual(result["canonical_name"], "onion")
        self.assertEqual(result["preparation"], ["chopped"])

    def test_onion_chopped(self):
        result = normalize_ingredient_name("onion, chopped")
        self.assertEqual(result["canonical_name"], "onion")
        self.assertEqual(result["preparation"], ["chopped"])

    def test_green_peppers(self):
        result = normalize_ingredient_name("green peppers, diced")
        self.assertEqual(result["canonical_name"], "green pepper")
        self.assertEqual(result["preparation"], ["diced"])

    def test_brown_sugar(self):
        self.assertEqual(
            normalize_ingredient_name("brown sugar")["canonical_name"],
            "brown sugar"
        )

    def test_baking_soda(self):
        self.assertEqual(
            normalize_ingredient_name("baking soda")["canonical_name"],
            "baking soda"
        )

    def test_ripe_bananas(self):
        self.assertEqual(
            normalize_ingredient_name("ripe bananas")["canonical_name"],
            "ripe bananas"
        )

    def test_ground_beef(self):
        self.assertEqual(
            normalize_ingredient_name("ground beef")["canonical_name"],
            "ground beef"
        )

    def test_original_preserved(self):
        result = normalize_ingredient_name("Eggs")
        self.assertEqual(result["original_name"], "Eggs")


if __name__ == "__main__":
    unittest.main()
