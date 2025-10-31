// src/components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }

    checkSession();

    // Listen to auth state changes
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) return <div>Checking access...</div>;

  return session?.user ? children : <Navigate to="/login" replace />;
}
