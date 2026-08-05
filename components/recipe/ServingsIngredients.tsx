"use client";

import { usePathname } from "next/navigation";
import { useRecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import { applyIngredientTranslations } from "@/lib/recipe/instructions";
import { formatAmount, scaleAndRound, scaleNutrition } from "@/lib/recipe/scaling";
import { toImperialAmount } from "@/lib/recipe/units";
import type { FullRecipe } from "@/lib/types/recipe";

interface ServingsIngredientsProps {
  dish: FullRecipe;
}

export function ServingsIngredients({ dish }: ServingsIngredientsProps): React.JSX.Element {
  const { servings, setServings } = useRecipeWorkspace();
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);
  const nutrition = scaleNutrition(dish.nutritionEstimate, dish.baseServings, servings);
  const ingredientGroups = applyIngredientTranslations(
    dish.ingredientGroups,
    locale === "bn" ? dish.translations?.bn : undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-clay-line bg-surface px-4 py-3">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/50">
          {dict.servingsIngredients.servings}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={dict.servingsIngredients.decreaseServings}
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-clay-line font-meta text-ink hover:border-turmeric"
          >
            −
          </button>
          <span className="w-6 text-center font-meta text-sm text-ink">{servings}</span>
          <button
            type="button"
            aria-label={dict.servingsIngredients.increaseServings}
            onClick={() => setServings(servings + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-clay-line font-meta text-ink hover:border-turmeric"
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
            {dict.servingsIngredients.resetTo(dish.baseServings)}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {ingredientGroups.map((group) => (
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
                const imperial = toImperialAmount(scaledAmount, item.unit);
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
                      {imperial && <span className="text-ink/50"> ({imperial})</span>}
                    </span>{" "}
                    {item.name}
                    {item.prepNote && <span className="text-ink/50">, {item.prepNote}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-clay-line pt-4">
        <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
          {dict.servingsIngredients.nutritionHeading}
        </h3>
        <dl className="grid grid-cols-4 gap-2 font-meta text-xs text-ink/80">
          <div>
            <dt className="text-ink/50">{dict.servingsIngredients.calories}</dt>
            <dd>{nutrition.calories}</dd>
          </div>
          <div>
            <dt className="text-ink/50">{dict.servingsIngredients.protein}</dt>
            <dd>{nutrition.proteinG}g</dd>
          </div>
          <div>
            <dt className="text-ink/50">{dict.servingsIngredients.carbs}</dt>
            <dd>{nutrition.carbsG}g</dd>
          </div>
          <div>
            <dt className="text-ink/50">{dict.servingsIngredients.fat}</dt>
            <dd>{nutrition.fatG}g</dd>
          </div>
          {nutrition.saturatedFatG !== undefined && (
            <div>
              <dt className="text-ink/50">{dict.servingsIngredients.satFat}</dt>
              <dd>{nutrition.saturatedFatG}g</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
