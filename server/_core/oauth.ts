import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { supabase } from "./supabase";

export function registerOAuthRoutes(app: Express) {
  // Rota de callback do Supabase (se o usuário usar OAuth via Supabase)
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const next = (req.query.next as string) || "/";

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        const sessionToken = data.session.access_token;
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        // Sync user
        const user = data.session.user;
        await db.upsertUser({
          openId: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || null,
          email: user.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
        });
      }
    }

    res.redirect(302, next);
  });
}
