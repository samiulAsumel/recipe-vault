import { formatAmountWithUnit, scaleIngredientAmount } from '@/lib/ingredient-scaling';
import type { IngredientGroup } from '@/types/recipe';

interface IngredientListProps {
  groups: IngredientGroup[];
  baseServings: number;
  servings: number;
}

/** Section 4: grouped by prep stage, pantry-staple items visually muted vs. shopping-list
 * items bolded. Every amount is derived from `servings` during render - no separate scaled
 * copy is stored anywhere. */
export function IngredientList({ groups, baseServings, servings }: IngredientListProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.groupName}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink/60">
            {group.groupName}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {group.items.map((item) => {
              const scaledAmount = scaleIngredientAmount(item.amount, baseServings, servings, item.unit);
              return (
                <li key={item.id} className="flex items-baseline gap-2 text-sm">
                  <span
                    className={`font-mono tabular-nums ${
                      item.pantryStaple ? 'text-ink/50' : 'text-ink'
                    }`}
                  >
                    {formatAmountWithUnit(scaledAmount, item.unit)}
                  </span>
                  <span className={item.pantryStaple ? 'text-ink/50' : 'font-semibold text-ink'}>
                    {item.name}
                  </span>
                  {item.prepNote ? <span className="text-ink/50">, {item.prepNote}</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
