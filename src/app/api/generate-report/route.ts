import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(
  request: Request
) {

  const {
    victories,
    defeats,
    testimonies,
  } = await request.json();

  try {

const model =
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

    const result =
  await model.generateContent(`

あなたは月末レポート作成アシスタントです。

以下は1か月の日記データです。

【勝利点】
${victories.join("\n")}

【敗北点】
${defeats.join("\n")}

【神様との出会い・証】
${testimonies.join("\n")}

ルール

・時系列を意識する
・本人らしい雰囲気を残す
・読みやすく整理する
・ネガティブ表現は消さない

以下のJSONのみを返してください。

説明文は禁止。
前置きは禁止。
Markdown禁止。
JSONのみ返してください。

{
  "victorySummary":"",
  "defeatSummary":"",
  "testimonySummary":""
}

`);

const text =
  result.response.text();

console.log(
  "Gemini response:",
  text
);

const cleaned =
  text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const parsed =
  JSON.parse(cleaned);

return NextResponse.json({
  victorySummary:
    parsed.victorySummary || "",

  defeatSummary:
    parsed.defeatSummary || "",

  testimonySummary:
    parsed.testimonySummary || "",
});

} catch (error) {

  console.error(error);

  return NextResponse.json(
    {
      error: "AI生成に失敗しました",
    },
    {
      status: 500,
    }
  );

}
}
