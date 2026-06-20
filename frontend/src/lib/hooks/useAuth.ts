"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (mounted) setState(s => ({ ...s, loading: false, error: error.message }));
          return;
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setState({
              user: session.user,
              profile,
              role: profile?.role || null,
              loading: false,
              error: null,
            });
          }
        } else {
          if (mounted) setState({ user: null, profile: null, role: null, loading: false, error: null });
        }
      } catch (err) {
        if (mounted) setState(s => ({ ...s, loading: false, error: "Failed to fetch session" }));
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setState({
              user: session.user,
              profile,
              role: profile?.role || null,
              loading: false,
              error: null,
            });
          }
        } else {
          if (mounted) setState({ user: null, profile: null, role: null, loading: false, error: null });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, role: null, loading: false, error: null });
  }, [supabase]);

  return {
    ...state,
    signOut,
    isAdmin: state.role === "admin",
    isInstructor: state.role === "instructor" || state.role === "admin",
    isStudent: state.role === "student",
    isAuthenticated: !!state.user && !!state.profile?.is_active,
  };
}
