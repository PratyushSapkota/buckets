import { Avatar, Flex, Text } from "@mantine/core";

import AuthButton from "./auth-button";

type Props = {
  email: string;
  image: string;
};
export function UserControl({ image, email }: Props) {
  return (
    <Flex direction={"column"}>
      <Avatar src={image} />
      <AuthButton action="signOut" />
      <Text>{email}</Text>
    </Flex>
  );
}
