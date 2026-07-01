"use client";

import { useState } from "react";
import { getBrowserSupabaseClient } from "@/src/lib/supabase/browser";
import { useAuthStore } from "@/src/state/auth-store";
import styles from "./AuthGate.module.css";

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function AuthGate() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  // Supabase not configured or auth still resolving → hide everything
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || loading) return null;

  // Signed-in: show a minimal identity bar
  if (user) {
    const handleSignOut = async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return;
      await supabase.auth.signOut();
      setUser(null);
    };

    return (
      <aside className={styles.gate} role="complementary">
        <div className={styles.userBar}>
          <span className={styles.userEmail}>{user.email}</span>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Déconnexion
          </button>
        </div>
      </aside>
    );
  }

  // Guest: sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setStatus("error");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  };

  return (
    <aside className={styles.gate} role="complementary" aria-label="Connexion">
      {status === "sent" ? (
        <p className={styles.confirmation}>
          Lien envoyé à {email} — vérifiez votre messagerie.
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <p className={styles.prompt}>
            Connectez-vous pour sauvegarder votre collection sur tous vos appareils.
          </p>
          <div className={styles.inputRow}>
            <input
              className={styles.emailInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresse@domaine.fr"
              required
              autoComplete="email"
              disabled={status === "sending"}
              aria-label="Adresse e-mail"
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={status === "sending" || !email.includes("@")}
            >
              {status === "sending" ? "…" : "Recevoir le lien"}
            </button>
          </div>
          {status === "error" && (
            <p className={styles.error} role="alert">
              Envoi impossible — vérifiez votre adresse et réessayez.
            </p>
          )}
        </form>
      )}
    </aside>
  );
}
