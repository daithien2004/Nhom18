import { z } from "zod";

export const FormLoginSchema = z.object({
  email: z.string().email("Vui lòng cung cấp một email hợp lệ"),
  password: z.string().nonempty("Password is required"),
});

export type formLogin = z.infer<typeof FormLoginSchema>;
