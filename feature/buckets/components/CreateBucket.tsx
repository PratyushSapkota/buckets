"use client";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { createBucket } from "../actions";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export function CreateBucket() {
  const [bucketName, setBucketName] = useState("");
  const [bucketCurrency, setBucketCurrency] = useState("");
  const [bucketColor, setBucketColor] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  async function onBucketCreate() {
    setDrawerOpen(false);

    await toast.promise(createBucket(bucketName, bucketCurrency, bucketColor), {
      loading: "Creating bucket...",
      success: "Bucket created!",
      error: (error) =>
        error instanceof Error ? error.message : "Failed to create bucket",
    });

    setBucketColor("");
    setBucketName("");
    setBucketCurrency("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onBucketCreate();
  }

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      swipeDirection={"right"}
    >
      <DrawerTrigger render={<Button>Create new</Button>} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new Bucket</DrawerTitle>
        </DrawerHeader>
        <form className="p-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex gap-4">
              <Field className="basis-[70%]">
                <FieldLabel htmlFor="bucket-name">Bucket name</FieldLabel>
                <Input
                  id="bucket-name"
                  value={bucketName}
                  onChange={(e) => {
                    e.preventDefault();
                    setBucketName(e.target.value);
                  }}
                />
              </Field>
              <Field className="basis-[30%]">
                <FieldLabel htmlFor="bucket-currency">Currency</FieldLabel>
                <Input
                  id="bucket-currency"
                  value={bucketCurrency}
                  onChange={(e) => {
                    e.preventDefault();
                    setBucketCurrency(e.target.value);
                  }}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <HexColorPicker color={bucketColor} onChange={setBucketColor} />
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
