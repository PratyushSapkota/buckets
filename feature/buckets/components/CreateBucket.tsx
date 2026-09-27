"use client";

import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button, Drawer, Input } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export function CreateBucket() {
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpened, { open: drawerOpen, close: drawerClose }] =
    useDisclosure(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
  };
  return (
    <>
      <Drawer opened={drawerOpened} onClose={drawerClose}>
        <form onSubmit={handleSubmit}>
          <Input.Wrapper label="Name">
            <Input name="bucketName" />
          </Input.Wrapper>
          <LoadingButton
            defaultText="Create Bucket"
            disabledText="Creating..."
            type="submit"
            loading={loading}
          />
        </form>
      </Drawer>

      <Button onClick={drawerOpen}>Create Bucket</Button>
    </>
  );
}
