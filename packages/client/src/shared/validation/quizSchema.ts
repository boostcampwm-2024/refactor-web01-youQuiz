import { z } from "zod";

const choiceSchema = z.object({
  content: z.string().min(1, "선택지 내용을 입력해야 합니다.").max(255, "선택지 내용은 255자 이하여야 합니다."),
  isCorrect: z.boolean(),
  position: z.number().int().nonnegative(),
});

const quizSchema = z.object({
  content: z.string().min(1, "퀴즈 제목을 입력해야 합니다.").max(255, "퀴즈 제목은 255자 이하여야 합니다."),
  quizType: z.enum(["TF", "MC"]),
  timeLimit: z.number().int().nonnegative(),
  point: z.number().int().nonnegative(),
  position: z.number().int().nonnegative(),
  choices: z.array(choiceSchema).min(2)
    .superRefine((choices, ctx) => {
      const hasCorrectChoice = choices.some((choice) => choice.isCorrect);

      if (!hasCorrectChoice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "적어도 하나의 정답을 선택해야 합니다.",
        })
      }
    })
})

const quizzesSchema = z.array(quizSchema).min(1);

export { quizSchema, choiceSchema, quizzesSchema };