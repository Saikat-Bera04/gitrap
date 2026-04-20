import { z } from "zod";

export const walletAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address")
  .transform((value) => value.toLowerCase());

export const githubUsernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, "Invalid GitHub username");

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  page: z.coerce.number().int().min(1).default(1)
});
