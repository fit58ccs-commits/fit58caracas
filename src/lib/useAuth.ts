"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();

    // Sesión actual
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios (login / logout)
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.href = "/login";
  };

  return { user, loading, signOut };
}
