import { z } from "zod";

export const countSchema = z.union([
  z.string().trim()
    .refine((s) => !/^0\d/.test(s), "No leading zeros")
    .transform((v) => (v === "" ? 0 : parseInt(v, 10))),
  z.number()
]).pipe(
  z.number()
    .min(0, "Must be 0 or positive")
    .max(9999900, "Max is 9.9M")
    .refine((n) => n % 100 === 0, "Must be a multiple of 100")
);

export type CountInput = z.infer<typeof countSchema>;

export const holidaySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 chars"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  initialCounts: z.object({
    200: z.preprocess((v) => (v === "" ? "0" : v), countSchema),
    100: z.preprocess((v) => (v === "" ? "0" : v), countSchema),
    50: z.preprocess((v) => (v === "" ? "0" : v), countSchema),
    10: z.preprocess((v) => (v === "" ? "0" : v), countSchema),
  }),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type HolidayInput = z.infer<typeof holidaySchema>;
