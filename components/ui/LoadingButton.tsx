"use client";

import { Button, Loader } from "@mantine/core";

type Props = {
  loading: boolean;
  defaultText: string;
  disabledText: string;
  type: "button" | "submit" | "reset";
};

export function LoadingButton({
  loading,
  defaultText,
  disabledText,
  type,
}: Props) {
  if (loading) {
    return (
      <Button disabled rightSection={<Loader size={"xs"} />}>
        {disabledText}
      </Button>
    );
  } else {
    return <Button type={type}>{defaultText}</Button>;
  }
}
