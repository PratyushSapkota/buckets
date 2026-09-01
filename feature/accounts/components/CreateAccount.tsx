"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { createAccount } from "../actions";
import { useIsMobile } from "@/hooks/use-mobile";

export function CreateAccount({
  bucketSelect,
}: {
  bucketSelect: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setDrawerOpen(false);

    const formData = new FormData(event.currentTarget);
    const accountName = formData.get("accountName")?.toString();
    const bucketId = formData.get("bucketId")?.toString();

    if (!accountName) {
      toast.add({
        type: "error",
        description: "Account name must not be empty",
      });
      return;
    }

    if (!bucketId) return;

    await toast.promise(createAccount(bucketId, accountName), {
      loading: "Creating account...",
      success: "Account Created!",
      error: (error) =>
        error instanceof Error ? error.message : "Failed to create bucket",
    });
  }
  return (
    <Drawer
      swipeDirection={useIsMobile() ? "down" : "right"}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    >
      <DrawerTrigger
        render={
          <Button variant={"outline"}>
            <PlusIcon />
          </Button>
        }
      />

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create Account</DrawerTitle>
        </DrawerHeader>
        <form className="m-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Account Name</FieldLabel>
              <Input id="account-name" name="accountName" />
            </Field>
            <Field>
              <FieldLabel>Parent Bucket</FieldLabel>
              {bucketSelect}
            </Field>
          </FieldGroup>

          <DrawerFooter>
            <Button type="submit">Create</Button>
            <DrawerClose
              render={<Button variant={"secondary"}>Close</Button>}
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
