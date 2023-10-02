import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(3).max(20),
    phone: z.string()
        .min(10).max(14)
        .refine(val => !isNaN(val as unknown as number)),
    password: z.string().min(6).max(50),
    confirmPassword: z.string().min(6).max(50)
});
