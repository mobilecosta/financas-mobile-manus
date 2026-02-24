import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);

  // Sincronizar sessão do Supabase com o cookie do servidor
  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSupabaseUser(session.user);
        // Definir cookie para o servidor tRPC
        document.cookie = `${COOKIE_NAME}=${session.access_token}; path=/; max-age=${ONE_YEAR_MS / 1000}; SameSite=None; Secure`;
      } else {
        setSupabaseUser(null);
        document.cookie = `${COOKIE_NAME}=; path=/; max-age=-1; SameSite=None; Secure`;
      }
      setIsSupabaseLoading(false);
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSupabaseUser(session.user);
        document.cookie = `${COOKIE_NAME}=${session.access_token}; path=/; max-age=${ONE_YEAR_MS / 1000}; SameSite=None; Secure`;
      } else {
        setSupabaseUser(null);
        document.cookie = `${COOKIE_NAME}=; path=/; max-age=-1; SameSite=None; Secure`;
      }
      utils.auth.me.invalidate();
    });

    return () => subscription.unsubscribe();
  }, [utils]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!supabaseUser,
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=-1; SameSite=None; Secure`;
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    if (user) {
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
    }
    return {
      user,
      loading: isSupabaseLoading || meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(supabaseUser && meQuery.data),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, isSupabaseLoading, supabaseUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
