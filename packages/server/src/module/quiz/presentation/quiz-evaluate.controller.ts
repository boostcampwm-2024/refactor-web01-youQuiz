import { Controller, Post, Get } from "@nestjs/common";
import { QuizEvaluationService } from "../application/quiz-evaluation.service";

@Controller("quiz-evaluation")
export class QuizEvaluationController {
  constructor(private readonly quizEvaluationService: QuizEvaluationService) {}

  @Post("create-dataset")
  async createDataset() {
    return await this.quizEvaluationService.createLargeDataset();
  }

  @Post("evaluate")
  async runEvaluation() {
    return await this.quizEvaluationService.runEvaluation();
  }
}
