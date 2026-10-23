"use client";
import { Button, ColorPicker, Grid, TextInput } from "@mantine/core";
import { SubmitEventHandler, useState } from "react";
import { addAccount } from "./accountActions";
import { useLedger } from "../ledger/LedgerProvider";

export function AccountForm() {
  const [accountName, setAccountName] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");

  const { addChange } = useLedger();

  const handleSubmit: SubmitEventHandler = async (event) => {
    event.preventDefault();
    await addAccount(accountName, bucketName, labelColor, addChange);
    setAccountName("");
    setBucketName("");
  };

  return (
    <form className="w-fit" onSubmit={handleSubmit}>
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            value={accountName}
            onChange={(e) => {
              e.preventDefault();
              setAccountName(e.target.value);
            }}
            label="Account Name"
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            value={bucketName}
            onChange={(e) => {
              e.preventDefault();
              setBucketName(e.target.value);
            }}
            label="Bucket"
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <ColorPicker
            format="hex"
            value={labelColor}
            onChange={setLabelColor}
            swatches={[
              "#2e2e2e",
              "#868e96",
              "#fa5252",
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
              "#40c057",
              "#82c91e",
              "#fab005",
              "#fd7e14",
            ]}
          />
        </Grid.Col>
        <Button type="submit">Create Account</Button>
      </Grid>
    </form>
  );
}
