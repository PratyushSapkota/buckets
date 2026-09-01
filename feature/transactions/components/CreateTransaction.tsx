import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateIncome } from "./CreateIncome";
import { CreateExpense } from "./CreateExpense";
import { CreateTransfer } from "./CreateTransfer";

export function CreateTransaction() {
  return (
    <div className="border border-amber-900">
      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <CreateIncome />
        </TabsContent>
        <TabsContent value="expense">
          <CreateExpense />
        </TabsContent>
        <TabsContent value="transfer">
          <CreateTransfer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
