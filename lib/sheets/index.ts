import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { getSheet } from "./client";
import { Creates, insertRows } from "./row";

export async function syncChanges(changes: LocalChange[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Auth required");
  }

  const email = session.user.email;

  if (!email) {
    throw new Error("User email is missing");
  }

  const sheet = await getSheet(email);
  

  // might have to shuffle these around
  // 1. insert the creates
  // 2. update the updates
  // 3. delete transaction

  let creates: Creates = [];

  changes.forEach((change) => {
    switch (change.action) {
      case "account/create":
        creates.push(change);
        break;
      case "account/archive":
        break;
      case "transaction/create":
        creates.push(change);
        break;
      case "transaction/delete":
        break;
      case "transaction/update":
        break;
    }
  });

  await insertRows(creates, sheet);
}
