import type { IngredientGroup, IngredientItem } from "@/lib/types/recipe";
import type { ValidationIssue } from "@/lib/admin/client";
import { fieldError, fieldErrorsWithPrefix } from "@/lib/admin/fieldError";
import { nextIngredientId, emptyIngredientGroup } from "@/lib/admin/emptyDish";
import { TextField, NumberField, CheckboxRow } from "../ui/FormControls";
import { RepeatableList } from "../ui/RepeatableList";

interface IngredientGroupsEditorProps {
  groups: IngredientGroup[];
  onChange: (groups: IngredientGroup[]) => void;
  errors: ValidationIssue[];
}

export function IngredientGroupsEditor({ groups, onChange, errors }: IngredientGroupsEditorProps): React.JSX.Element {
  return (
    <div>
      <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Ingredient groups</span>
      {fieldError(errors, "ingredientGroups") && (
        <p className="mb-2 font-body text-xs text-paprika">{fieldError(errors, "ingredientGroups")}</p>
      )}
      <RepeatableList
        items={groups}
        onChange={onChange}
        makeNew={emptyIngredientGroup}
        addLabel="Add ingredient group"
        emptyLabel="No ingredient groups yet."
        renderItem={(group, updateGroup) => {
          const groupIndex = groups.indexOf(group);
          const groupPrefix = `ingredientGroups[${groupIndex}]`;
          return (
            <div className="flex flex-col gap-3">
              <TextField
                label="Group name"
                value={group.groupName}
                onChange={(v) => updateGroup({ ...group, groupName: v })}
                error={fieldError(errors, `${groupPrefix}.groupName`)}
                placeholder="e.g. For the mutton marinade"
              />
              {fieldError(errors, `${groupPrefix}.items`) && (
                <p className="font-body text-xs text-paprika">{fieldError(errors, `${groupPrefix}.items`)}</p>
              )}
              <RepeatableList
                items={group.items}
                onChange={(items) => updateGroup({ ...group, items })}
                makeNew={() => ({
                  id: nextIngredientId(groups),
                  name: "",
                  amount: 0,
                  unit: null,
                  prepNote: null,
                  pantryStaple: false,
                })}
                addLabel="Add ingredient"
                emptyLabel="No ingredients in this group yet."
                renderItem={(item, updateItem) => (
                  <IngredientItemRow
                    item={item}
                    onChange={updateItem}
                    errors={fieldErrorsWithPrefix(errors, `${groupPrefix}.items[${group.items.indexOf(item)}]`)}
                  />
                )}
              />
            </div>
          );
        }}
      />
    </div>
  );
}

interface IngredientItemRowProps {
  item: IngredientItem;
  onChange: (item: IngredientItem) => void;
  errors: ValidationIssue[];
}

function IngredientItemRow({ item, onChange, errors }: IngredientItemRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-meta text-xs text-ink/40">id: {item.id}</p>
      <div className="grid gap-2 sm:grid-cols-4">
        <TextField
          label="Name"
          value={item.name}
          onChange={(v) => onChange({ ...item, name: v })}
          error={fieldError(errors, "name")}
        />
        <NumberField
          label="Amount"
          value={item.amount}
          onChange={(v) => onChange({ ...item, amount: v })}
          error={fieldError(errors, "amount")}
        />
        <TextField label="Unit" value={item.unit ?? ""} onChange={(v) => onChange({ ...item, unit: v || null })} />
        <TextField
          label="Prep note"
          value={item.prepNote ?? ""}
          onChange={(v) => onChange({ ...item, prepNote: v || null })}
        />
      </div>
      <CheckboxRow
        label="Pantry staple"
        checked={item.pantryStaple}
        onChange={(v) => onChange({ ...item, pantryStaple: v })}
      />
    </div>
  );
}
