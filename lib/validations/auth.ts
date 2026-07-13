import { z } from "zod";

/**
 * Admin login form — email + password only. No registration, no
 * forgot-password, no OAuth/magic-link/OTP schemas exist in this file
 * on purpose; this project has exactly one authentication flow.
 */
export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
