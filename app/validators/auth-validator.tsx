import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(3).max(20),
    phone: z.string()
        .min(10).max(10)
        .refine(val => !isNaN(val as unknown as number)),
    password: z.string().min(6).max(50)
    .refine(password => {
        // Password should contain at least one uppercase letter
        // Password should contain at least one lowercase letter
        // Password should contain at least one digit
        // Password should contain at least one special character
        return /[A-Z]/.test(password) &&
          /[a-z]/.test(password) &&
          /\d/.test(password) &&
          /[!@#$%^&*()_+[\]{};':"\\|,.<>/?]+/.test(password);
      },{message:"The password should contain both upper case and lower case and atleast a digit, special charter "}),
    confirmPassword: z.string().min(6).max(50)
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(50),
});

export const passSchema = z.object({
    email: z.string().email(),
});
