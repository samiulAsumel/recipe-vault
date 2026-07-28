"use client";

import { useState } from "react";
import { formatAmount, scaleAndRound, scaleNutrition } from "@/lib/recipe/scaling";
import type { FullRecipe } from "@/lib/types/recipe";

interface ServingsIngredientsProps {
  dish: FullRecipe;
}

export function ServingsIngredients({ dish }: ServingsIngredientsProps): React.JSX.Element {
  const [servings, setServings] = useState(dish.baseServings);
  const nutrition = scaleNutrition(dish.nutritionEstimate, dish.baseServings, servings);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border border-clay-line px-4 py-3">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/50">Servings</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease servings"
            onClick={() => setServings((current) => Math.max(1, current - 1))}
            className="flex h-7 w-7 items-center justify-center border border-clay-line font-meta text-ink hover:border-ink"
          >
            −
          </button>
          <span className="w-6 text-center font-meta text-sm text-ink">{servings}</span>
          <button
            type="button"
            aria-label="Increase servings"
            onClick={() => setServings((current) => current + 1)}
            className="flex h-7 w-7 items-center justify-center border border-clay-line font-meta text-ink hover:border-ink"
          >
            +
          </button>
        </div>
        {servings !== dish.baseServings && (
          <button
            type="button"
            onClick={() => setServings(dish.baseServings)}
            className="font-meta text-xs text-paprika hover:underline"
          >
            Reset to {dish.baseServings}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {dish.ingredientGroups.map((group) => (
          <div key={group.groupName} className="flex flex-col gap-2">
            <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {group.groupName}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const scaledAmount = scaleAndRound(
                  item.amount,
                  item.unit,
                  dish.baseServings,
                  servings,
                );
                return (
                  <li
                    key={item.id}
                    className={`font-body text-sm ${
                      item.pantryStaple ? "text-ink/50" : "font-medium text-ink"
                    }`}
                  >
                    <span className="font-meta">
                      {formatAmount(scaledAmount)}
                      {item.unit ? ` ${item.unit}` : ""}
                    </span>{" "}
                    {item.name}
                    {item.prepNote && (
                      <span className="text-ink/50">, {item.prepNote}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-clay-line pt-4">
        <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
          Nutrition (per serving batch)
        </h3>
        <dl className="grid grid-cols-4 gap-2 font-meta text-xs text-ink/80">
          <div>
            <dt className="text-ink/50">Calories</dt>
            <dd>{nutrition.calories}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Protein</dt>
            <dd>{nutrition.proteinG}g</dd>
          </div>
          <div>
            <dt className="text-ink/50">Carbs</dt>
            <dd>{nutrition.carbsG}g</dd>
          </div>
          <div>
            <dt className="text-ink/50">Fat</dt>
            <dd>{nutrition.fatG}g</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
