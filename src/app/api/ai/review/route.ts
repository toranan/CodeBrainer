// // import { NextResponse } from "next/server"

// // interface ReviewRequest {
// //   userCode: string
// //   language: string
// //   problemId: string
// // }

// // export async function POST(request: Request) {
// //   const body = (await request.json()) as ReviewRequest

// //   if (!body.userCode || !body.language || !body.problemId) {
// //     return NextResponse.json(
// //       { error: "userCode, language, problemId는 필수입니다." },
// //       { status: 400 }
// //     )
// //   }

// //   // TODO: 실제 모범답안 비교 및 외부 AI 호출 로직 추가
// //   return NextResponse.json({
// //     improvements: [
// //       "코드가 문제 요구사항을 만족합니다.",
// //       "시간 복잡도가 O(n)으로 적절합니다.",
// //     ],
// //     altApproaches: [
// //       "스택을 활용한 풀이도 동일한 결과를 얻을 수 있습니다.",
// //       "reduce 함수를 사용한 함수형 접근을 고려해 보세요.",
// //     ],
// //     finalSolution: {
// //       language: body.language,
// //       code: body.userCode,
// //       notes: "임시 AI 리뷰 응답입니다.",
// //     },
// //   })
// // }
// import { NextRequest, NextResponse } from "next/server";
// import { reviewChain } from "@/server/ai/gemini";

// export const runtime = "nodejs"; // Edge에서 Google SDK 에러 방지

// type Req = {
//   language: string;   // "javascript" | "python" | ...
//   code: string;
//   rubric?: string;    // 선택: 팀 코딩 컨벤션, 금칙 사항 등
//   fewshots?: Array<{role:"human"|"ai"; content:string}>;
// };

// export async function POST(req: NextRequest) {
//   try {
//     const body = (await req.json()) as Req;

//     const fewshots =
//       body.fewshots?.map(m => ({
//         role: m.role === "human" ? "human" : "ai",
//         content: m.content,
//       })) ?? [
//         // 기본 Few-shot 예시 1
//         { role: "human", content:
//           "언어: javascript\n요구사항: var 금지, 함수는 단일 책임\n대상 코드:\n```javascript\nvar x=1;function a(){return 1;}function b(){return 2;}\n```" },
//         { role: "ai", content:
//           JSON.stringify({
//             summary:"var 사용, 책임 분리가 미흡합니다.",
//             score: 62,
//             issues:[
//               {title:"var 사용",severity:"medium",detail:"블록 스코프 미보장",lineHints:[1]},
//               {title:"함수 책임 분리 약함",severity:"low",detail:"테스트 용이성 저하",lineHints:[1]}
//             ],
//             suggestions:["let/const로 변경","함수 역할 분리 및 테스트 추가"]
//           })
//         }
//       ];

//     const result = await reviewChain.invoke({
//       language: body.language,
//       rubric: body.rubric ?? "일반 웹 서비스 백엔드 품질 기준",
//       code: body.code,
//       fewshots,
//     });

//     return NextResponse.json(result, { status: 200 });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "AI 리뷰 실패" },
//       { status: 500 }
//     );
//   }
// }
