import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { cache } from "react";

// export async function getUser() {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (error) {
//     if (isAuthSessionMissingError(error)) return null;
//     throw error;
//   }
//   return user;
// }


export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isAuthSessionMissingError(error)) return null;
    throw error;
  }

  return user;
});