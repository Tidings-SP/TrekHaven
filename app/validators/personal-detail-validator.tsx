import { z } from "zod";

const isDateOfBirthPositive = (dateString: string) => {
  const dateOfBirth = new Date(dateString);
  const currentDate = new Date();
  const ageDiff = currentDate.getFullYear() - dateOfBirth.getFullYear();

  if (ageDiff < 0) {
    return false;
  }

  if (
    ageDiff === 0 &&
    currentDate.getMonth() < dateOfBirth.getMonth()
  ) {
    return false;
  }

  if (
    ageDiff === 0 &&
    currentDate.getMonth() === dateOfBirth.getMonth() &&
    currentDate.getDate() < dateOfBirth.getDate()
  ) {
    return false;
  }

  return true;
};


export const personalDetailSchema = z.object({
  name: z.string().min(3).max(20).refine((name) => {
    // Check if the same character is repeated consecutively
    let isConsecutive = true;
    for (let i = 1; i < name.length; i++) {
      if (name[i] != name[i - 1]) {
        return true;
      }
    }
    return false;
  }, { message: "Name should not contain consecutive repeating characters." })
  .refine((name) => {
    // Check if the string starts with a space
    return !name.startsWith(" ");
  }, { message: "Name must not start with a space." }),
  phone: z.string()
  .min(10, { message: "Phone number must be at least 10 digits long." })
  .max(10, { message: "Phone number must be at most 10 digits long." })
  .refine(val => /^[6789]/.test(val), { message: "Phone number must start with 6, 7, 8, or 9." })
  .refine(val => !isNaN(val as unknown as number), { message: "Phone number must contain only digits." }),
    dobId: z.string()
    .refine(isDateOfBirthPositive, {
      message: "Date of birth must be positive",
    }),
  
})

