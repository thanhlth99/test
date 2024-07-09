import {
  GetRecipes,
  GetProductsForIngredient,
  GetBaseUoM,
} from "./supporting-files/data-access";
import {
  GetCostPerBaseUnit,
  ConvertUnits,
  GetNutrientFactInBaseUnits,
  aggregateNutrients,
  sortKeysAlphabetically,
} from "./supporting-files/helpers";
import { ExpectedRecipeSummary, RunTest } from "./supporting-files/testing";
import { NutrientFact } from "./supporting-files/models";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
console.log("Recipe Data:", recipeData);
const recipeSummary: any = {}; // the final result to pass into the test function
/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

recipeData.forEach((recipeItem) => {
  // initialize cost of the recipe
  let costOfRecipe = 0;
  // initialize the nutrients of the recipe
  let nutrientReceipt: NutrientFact[] = [];
  recipeItem.lineItems.forEach((lineItem) => {
    // get each ingredient
    let costOfIngredient = MAX_VALUE;
    // initialize the nutrient of the ingredient
    let nutrientItem: NutrientFact[] = [];

    // get the products of the ingredient
    const productsForIngredient = GetProductsForIngredient(lineItem.ingredient);
    // get the base unit of measure of the ingredient
    const baseUoM = GetBaseUoM(lineItem.unitOfMeasure.uomType);
    // convert the unit of measure of the ingredient to the base unit of measure of the ingredient
    const convertUnitBasedCost = ConvertUnits(
      lineItem.unitOfMeasure,
      baseUoM.uomName,
      baseUoM.uomType
    );

    // find the product with the lowest cost per base unit of measure
    productsForIngredient.forEach((product) => {
      product.supplierProducts.forEach((supplier) => {
        // get the cost per base unit of measure of the supplier product
        const costPerBaseUnit = GetCostPerBaseUnit(supplier);
        // update the cost of ingredient and the nutrientItem if the cost per base unit of measure is lower than the current cost of ingredient
        if (costPerBaseUnit < costOfIngredient) {
          costOfIngredient = costPerBaseUnit;
          nutrientItem = product.nutrientFacts;
        }
      });
    });

    // update the cost of the recipe 
    costOfRecipe += costOfIngredient * convertUnitBasedCost.uomAmount;
    // get the nutrients of the product in base unit and add them to the nutrient receipt of the recipe
    const nutrient = nutrientItem.map((nutrient) =>
      GetNutrientFactInBaseUnits(nutrient)
    );
    nutrientReceipt = nutrientReceipt.concat(nutrient);
  });

  // calculate the sum of nutrient and sort alphabetically
  const nutrientsAtCheapestCost = sortKeysAlphabetically(
    aggregateNutrients(nutrientReceipt)
  );

  recipeSummary[recipeItem.recipeName] = {
    cheapestCost: costOfRecipe,
    nutrientsAtCheapestCost: nutrientsAtCheapestCost,
  };
});

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);

