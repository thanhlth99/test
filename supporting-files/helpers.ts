import {
    NutrientFact,
    SupplierProduct,
    UnitOfMeasure,
    UoMName,
    UoMType,
  } from "./models";
  import { GetBaseUoM, GetUnitsData, NutrientBaseUoM } from "./data-access";
  
  /*
   * Converts from one unit of measure to another requested unit of measure
   */
  export function ConvertUnits(
    fromUoM: UnitOfMeasure,
    toUoMName: UoMName,
    toUoMType: UoMType
  ): UnitOfMeasure {
    if (fromUoM.uomName === toUoMName && fromUoM.uomType === toUoMType)
      return fromUoM;
  
    const conversionRate = GetUnitsData().find(
      (x) =>
        x.fromUnitName === fromUoM.uomName &&
        x.fromUnitType === fromUoM.uomType &&
        x.toUnitName === toUoMName &&
        x.toUnitType === toUoMType
    );
  
    if (!conversionRate)
      throw new Error(`Couldn't convert ${fromUoM.uomName} to ${toUoMName}`);
  
    return {
      uomAmount: fromUoM.uomAmount * conversionRate.conversionFactor,
      uomName: toUoMName,
      uomType: toUoMType,
    };
  }
  
  /*
   * Takes in two units of measure and returns the sum of both in the same base unit as A
   */
  export function SumUnitsOfMeasure(
    uomA: UnitOfMeasure,
    uomB: UnitOfMeasure
  ): UnitOfMeasure {
    const convertedUomB = ConvertUnits(uomB, uomA.uomName, uomA.uomType);
    return {
      uomAmount: uomA.uomAmount + convertedUomB.uomAmount,
      uomName: uomA.uomName,
      uomType: uomA.uomType,
    };
  }
  
  /*
   * Calculates the cost price for a given supplier product,
   * in the base unit of measure for that product
   */
  export function GetCostPerBaseUnit(supplierProduct: SupplierProduct): number {
    const baseUnitOfMeasure = GetBaseUoM(
      supplierProduct.supplierProductUoM.uomType
    );
  
    const converted = ConvertUnits(
      supplierProduct.supplierProductUoM,
      baseUnitOfMeasure.uomName,
      baseUnitOfMeasure.uomType
    );
  
    return supplierProduct.supplierPrice / converted.uomAmount;
  }
  
  /*
   * Takes in a nutrient fact and converts its measurements into the appropriate
   * base unit of measure for nutrients
   */
  export function GetNutrientFactInBaseUnits(fact: NutrientFact): NutrientFact {
    return {
      nutrientName: fact.nutrientName,
      quantityAmount: ConvertUnits(
        fact.quantityAmount,
        NutrientBaseUoM.uomName,
        NutrientBaseUoM.uomType
      ),
      quantityPer: ConvertUnits(
        fact.quantityPer,
        NutrientBaseUoM.uomName,
        NutrientBaseUoM.uomType
      ),
    };
  }
  
  export const aggregateNutrients = (
    nutrients: NutrientFact[]
  ): { [key: string]: NutrientFact } => {
    const resultNutrientFact: { [key: string]: NutrientFact } = {};
  
    nutrients.forEach((item) => {
      const { nutrientName, quantityAmount, quantityPer } = item;
  
      // If the nutrient doesn't exist in the result object, create a new entry
      if (!resultNutrientFact[nutrientName]) {
        resultNutrientFact[nutrientName] = {
          nutrientName,
          quantityAmount: { ...quantityAmount },
          quantityPer: quantityPer,
        };
      } else {
    // If the nutrient does exist, add the quantity amounts together
        resultNutrientFact[nutrientName].quantityAmount.uomAmount +=
          quantityAmount.uomAmount;
      }
    });
  
    return resultNutrientFact;
  };
  
  // Function to sort keys in an object alphabetically, ignoring case sensitivity
  const compareFunction = (a: string, b: string): number =>
    a.localeCompare(b, "en", { sensitivity: "base" });
  
  // Function to sort keys in an object alphabetically
  export const sortKeysAlphabetically = (obj: {
    [key: string]: NutrientFact;
  }): { [key: string]: NutrientFact } => {
    const sortedKeys = Object.keys(obj).sort(compareFunction);
    const sortedObj: { [key: string]: NutrientFact } = {};
  
    sortedKeys.forEach((key) => {
      sortedObj[key] = obj[key];
    });
  
    return sortedObj;
  };
  