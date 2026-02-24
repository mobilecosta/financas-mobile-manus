import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { supabase } from "./supabase";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; email?: string; name?: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      // No Supabase, o token de sessão é um JWT. 
      // Podemos verificar diretamente com o Supabase ou via JWT secret se for o mesmo.
      // Como o usuário quer substituir pelo do Supabase, vamos usar o cliente do Supabase para validar o token.
      const { data: { user }, error } = await supabase.auth.getUser(cookieValue);
      
      if (error || !user) {
        console.warn("[Auth] Supabase session verification failed", error?.message);
        return null;
      }

      return {
        openId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    
    if (!sessionCookie) {
      throw ForbiddenError("Missing session cookie");
    }

    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in DB, sync from Supabase session info
    if (!user) {
      try {
        await db.upsertUser({
          openId: sessionUserId,
          name: session.name || null,
          email: session.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(sessionUserId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from Supabase:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
