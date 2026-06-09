"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  auth,
  db,
} from "../../lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";


function PDFContent() {

  const params =
    useSearchParams();

  const month =
    params.get("month");

  const uid =
  params.get("uid");

  const [report, setReport] =
  useState<any>(null);

  const [darkMode, setDarkMode] =
  useState(() => {

    if (
      typeof window !==
      "undefined"
    ) {

      return (
        localStorage.getItem(
          "darkMode"
        ) === "true"
      );

    }

    return false;

  });

  useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (user) => {

        if (!user || !month)
          return;

        const snapshot =
          await getDoc(
            doc(
  db,
  "users",
  uid || user.uid,
  "monthly_reports",
  month
)

          );

        if (
          snapshot.exists()
        ) {

          setReport(
            snapshot.data()
          );

        }

      }
    );

  return () =>
    unsubscribe();

}, [month]);

useEffect(() => {

  const savedMode =
    localStorage.getItem(
      "darkMode"
    );

  if (savedMode) {

    setDarkMode(
      JSON.parse(
        savedMode
      )
    );

  }

}, []);

if (!report)
  return <div>読み込み中...</div>;

 return (

<main
  className={`min-h-screen p-12 ${
    darkMode
      ? "bg-gray-900 text-white"
      : "bg-white text-black"
  }`}
>

  <div className="mx-auto max-w-4xl">

<div className="mb-8 flex items-center justify-between">

  <Link
    href="/monthly-reports/history"
    className={`text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-500"
    }`}
  >
    ← 月末レポート履歴へ戻る
  </Link>

  <div className="flex items-center gap-3">

    <button
      onClick={() => window.print()}
      className={`rounded-xl px-4 py-2 text-sm ${
        darkMode
          ? "bg-gray-700 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      🖨 印刷
    </button>

    <button
      onClick={() => {
        const newMode =
          !darkMode;

        setDarkMode(
          newMode
        );

        localStorage.setItem(
          "darkMode",
          JSON.stringify(
            newMode
          )
        );
      }}
    >
      {darkMode
        ? "☀️"
        : "🌙"}
    </button>

  </div>

</div>

  <h1 className="mb-10 text-center text-3xl font-bold">
    {month} 月末レポート
  </h1>

  <div className="mb-8">

    <p>
      班：{report.team}
    </p>

    <p>
      名前：{report.name}
    </p>

  </div>

  <hr className="my-8" />

  <h2 className="mb-4 text-2xl font-bold">
    今月の目標
  </h2>

  <p>
    内的目標：
    {report.goal?.innerGoal}
  </p>

  <p>
    目標件数：
    {report.goal?.targetCount}件
    →
    {report.actualCount}件
  </p>

  <p>
    目標金額：
    ¥{Number(
      report.goal?.targetAmount || 0
    ).toLocaleString()}
    →
    ¥{Number(
      report.actualAmount || 0
    ).toLocaleString()}
  </p>

  <hr className="my-8" />

  <h2 className="mb-4 text-2xl font-bold">
    勝利点
  </h2>

  <p className="whitespace-pre-wrap">
    {report.victorySummary}
  </p>

  <hr className="my-8" />

  <h2 className="mb-4 text-2xl font-bold">
    敗北点
  </h2>

  <p className="whitespace-pre-wrap">
    {report.defeatSummary}
  </p>

  <hr className="my-8" />

  <h2 className="mb-4 text-2xl font-bold">
    神様との出会い・証
  </h2>

  <p className="whitespace-pre-wrap">
    {report.testimonySummary}
  </p>

  <hr className="my-8" />

  <h2 className="mb-4 text-2xl font-bold">
    来月の目標
  </h2>

  <p>
    内的目標：
    {report.nextGoal?.innerGoal}
  </p>

  <p>
    目標件数：
    {report.nextGoal?.targetCount}件
  </p>

  <p>
    目標金額：
    ¥{Number(
      report.nextGoal?.targetAmount || 0
    ).toLocaleString()}
  </p>

</div>

</main>

);

}

export default function PDFPage() {

  return (
    <Suspense
      fallback={
        <div>
          読み込み中...
        </div>
      }
    >
      <PDFContent />
    </Suspense>
  );

}
