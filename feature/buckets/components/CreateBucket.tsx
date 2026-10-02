"use client";

import { useMobile } from "@/hooks/useMobile";
import {
  Box,
  Button,
  Drawer,
  Group,
  Input,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function CreateBucket() {
  const [drawerOpened, { open: drawerOpen, close: drawerClose }] =
    useDisclosure(false);

  const [loading, { set: setLoading }] = useDisclosure(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    drawerClose();
    setLoading(false);
  };

  return (
    <>
      <Drawer
        opened={drawerOpened}
        onClose={drawerClose}
        position={useMobile() ? "bottom" : "right"}
        title={"Create bucket"}
        styles={{
          title: {
            fontSize: "24px",
            fontWeight: 700
          }
        }}
      >
        <Box>
          <LoadingOverlay visible={loading} zIndex={1000} />
          <form onSubmit={handleSubmit}>
            <Stack>
              <Input.Wrapper label="Bucket name">
                <Input type="text" />
              </Input.Wrapper>
              <Group justify="flex-end">
                <Button type="submit">Submit</Button>
                <Button variant="outline" onClick={drawerClose}>
                  Close
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Drawer>
      <Button onClick={drawerOpen}>Create bucket</Button>
    </>
  );
}
