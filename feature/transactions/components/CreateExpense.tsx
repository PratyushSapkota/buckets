import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CreateExpense() {
  return (
    <form>
      <FieldGroup>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Input />
        </Field>
      </FieldGroup>
    </form>
  );
}
