// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
// import { StructuredOutputParser } from "@langchain/core/output_parsers";
// import { z } from "zod";

// export const reviewParser = StructuredOutputParser.fromZodSchema(
//   z.object({
//     summary: z.string().describe("핵심 요약. 한글 2~3문장"),
//     score: z.number().min(0).max(100).describe("0~100 정수 점수"),
//     issues: z.array(
//       z.object({
//         title: z.string(),
//         severity: z.enum(["low","medium","high"]),
//         detail: z.string(),
//         lineHints: z.array(z.number()).describe("문제 가능성이 높은 코드 라인 번호")
//       })
//     ),
//     suggestions: z.array(z.string()).describe("개선 제안. 간결한 불릿"),
//   })
// );

// const formatInstructions = reviewParser.getFormatInstructions();

// export const reviewPrompt = ChatPromptTemplate.fromMessages([
//   ["system",
//    [
//      "당신은 엄격한 코드 리뷰어입니다.",
//      "한국어로만 답합니다.",
//      "보안, 성능, 가독성, 테스트 용이성을 우선합니다.",
//      "요청된 JSON 스키마로만 출력합니다.",
//    ].join("\n")
//   ],
//   new MessagesPlaceholder("fewshots"),
//   ["human",
//    [
//      "언어: {language}",
//      "요구사항/룰: {rubric}",
//      "대상 코드:\n```{language}\n{code}\n```",
//      "",
//      "출력 형식 지시:",
//      formatInstructions
//    ].join("\n")
//   ],
// ]);

// export const reviewModel = new ChatGoogleGenerativeAI({
//   model: "gemini-1.5-pro",
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
//   // 필요시 온도 조절
//   temperature: 0.2,
// });

// export const reviewChain = reviewPrompt
//   .pipe(reviewModel)
//   .pipe(reviewParser);
