import { z } from "zod";

const isDateOfBirthValid = (dateString: string) => {
  const dateOfBirth = new Date(dateString);
  const currentDate = new Date();
  const ageDiff = currentDate.getFullYear() - dateOfBirth.getFullYear();

  if (ageDiff < 18) {
    return false;
  }

  if (
    ageDiff === 18 &&
    currentDate.getMonth() < dateOfBirth.getMonth()
  ) {
    return false;
  }

  if (
    ageDiff === 18 &&
    currentDate.getMonth() === dateOfBirth.getMonth() &&
    currentDate.getDate() < dateOfBirth.getDate()
  ) {
    return false;
  }

  return true;
};

const passwordsMatch = (data: { password: string; confirmPassword: string }) => {
  return data.password === data.confirmPassword;
};

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(20).refine((name) => {
    // Check if the same character is repeated consecutively
    let isConsecutive = true;
    for (let i = 1; i < name.length; i++) {
      if (name[i] != name[i - 1]) {
        return true;
      }
    }
    return false;
  }, { message: "Name should not contain consecutive repeating characters." }),
  phone: z.string()
  .min(10, { message: "Phone number must be at least 10 digits long." })
  .max(10, { message: "Phone number must be at most 10 digits long." })
  .refine(val => /^[6789]/.test(val), { message: "Phone number must start with 6, 7, 8, or 9." })
  .refine(val => !isNaN(val as unknown as number), { message: "Phone number must contain only digits." }),
  password: z.string().min(8).max(50)
    .refine(password => {
      // Password should contain at least one uppercase letter
      // Password should contain at least one lowercase letter
      // Password should contain at least one digit
      // Password should contain at least one special character
      return /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*()_+[\]{};':"\\|,.<>/?]+/.test(password);
    }, { message: "The password should contain both upper case and lower case and atleast a digit, special charter " }),
  confirmPassword: z.string().min(8).max(50),
  dob: z.string()
    .refine(isDateOfBirthValid, {
      message: "Date of birth must be greater than or equal to 18 years ago",
    }),
  pincode: z.string().min(6).max(6),
  area: z
    .string({
      required_error: "Please select your area.",
    }),
    doorno: z
    .string()
    .min(2, {
      message: "Door number must be at least 2 characters.",
    })
    .max(10, {
      message: "Door number not be longer than 10 characters.",
    }),
    street: z
    .string()
    .min(3, {
      message: "Street Addr must be at least 3 characters.",
    })
    .max(30, {
      message: "Street Addr not be longer than 30 characters.",
    }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match", // Set custom message for password mismatch
});



export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export const passSchema = z.object({
  email: z.string().email(),
});
