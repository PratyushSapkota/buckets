import { useMobile } from "@/hooks/use-mobile";
import {
  Avatar,
  Flex,
  Loader,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { SunIcon, LogOutIcon, UserIcon } from "lucide-react";

import { signOut } from "next-auth/react";
import { useRef, useState } from "react";
import { useUser } from "./AuthProvider";

export function UserControl() {
  const [signOutLoading, setSignOutLoading] = useState(false);
  const isMobile = useMobile();
  const inFlight = useRef(false);

  const dropDownIconSize = 16;

  const user = useUser();

  async function handleSignOut() {
    if (inFlight.current) return;
    inFlight.current = true;
    setSignOutLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
    } finally {
      inFlight.current = false;
      setSignOutLoading(false);
    }
  }

  return (
    <Menu>
      <Menu.Target>
        <UnstyledButton className="accountButton">
          {isMobile ? (
            <Avatar src={user?.image ?? ""} />
          ) : (
            <Flex direction={"row"} align={"center"} gap={"0.5rem"}>
              <Avatar size={"md"} src={user?.image ?? ""}>
                <UserIcon />
              </Avatar>
              <div>
                <Flex direction={"column"}>
                  <Text size="md">{user?.name ?? "User"}</Text>
                  <Text size="sm" c={"dimmed"}>
                    {user?.email ?? "email"}
                  </Text>
                </Flex>
              </div>
            </Flex>
          )}
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<SunIcon size={dropDownIconSize} />}>
          Dark Theme
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={
            signOutLoading ? (
              <Loader size={dropDownIconSize} />
            ) : (
              <LogOutIcon size={dropDownIconSize} />
            )
          }
          onClick={handleSignOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
