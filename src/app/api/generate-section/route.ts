import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(
  request: Request
) {

 const {
  type,
  data,
} = await request.json();

 console.log(
  "GEMINI KEY:",
  process.env.GEMINI_API_KEY?.slice(0, 15)
);

console.log(
  "FULL LENGTH",
  process.env.GEMINI_API_KEY?.length
);

try {

  console.log(
    "KEY LENGTH:",
    process.env.GEMINI_API_KEY?.length
  );

  const model =
    genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

 const result =
  await model.generateContent(`

あなたは月末レポート作成アシスタントです。

以下は1か月の勝利点です。

${data.join("\n")}

ルール

・時系列を意識する
・本人らしい雰囲気を残す
・読みやすく整理する

以下のJSONのみを返してください。

{
  "summary":""
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

console.log("RAW RESPONSE");
console.log(text);

console.log("CLEANED RESPONSE");
console.log(cleaned);

const parsed =
  JSON.parse(cleaned);

return NextResponse.json({
  summary:
    parsed.summary || "",
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
