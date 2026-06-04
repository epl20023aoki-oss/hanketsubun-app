"use client";

import {
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


export default function PDFPage() {

  const params =
    useSearchParams();

  const month =
    params.get("month");

  const [report, setReport] =
  useState<any>(null);

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
              user.uid,
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

  if (!report)
    return;

  const timer =
    setTimeout(() => {

      window.print();

    }, 500);

  return () =>
    clearTimeout(timer);

}, [report]);

if (!report)
  return <div>読み込み中...</div>;

  return (

<main className="mx-auto max-w-4xl bg-white p-12 text-black">

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

</main>

);

}