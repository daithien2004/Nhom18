import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().min(1, "Thiếu từ khóa tìm kiếm"),
});
