"use client";

import { useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "../../lib/firebase";

import Link from "next/link";

export default function ReportPage() {

  const params =
    useSearchParams();

  const uid =
    params.get("uid");

  const month =
    params.get("month");

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

  if (!uid || !month)
    return;

  const fetchReport =
    async () => {

      const snapshot =
        await getDoc(
          doc(
            db,
            "users",
            uid,
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

    };


  fetchReport();

}, [uid, month]);

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

  return (

   <main
  className={`min-h-screen p-6 ${
    darkMode
      ? "bg-gray-900 text-white"
      : "bg-white text-gray-900"
  }`}
>

  <div className="mx-auto max-w-4xl">

<div className="mb-8 flex items-center justify-between">

  <Link
    href="/admin"
    className="text-sm text-gray-400"
  >
    ← 提出一覧へ戻る
  </Link>

  <div className="flex items-center gap-4">

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

      <h1 className="text-3xl font-bold">
        月末レポート
      </h1>

     {report ? (

  <>

    <h2 className="mt-6 text-2xl">
      {report.name}
    </h2>

    <p className="mt-2">
      {report.team}
    </p>

    <p className="mt-6">
      {report.victorySummary}
    </p>

  </>

) : (

  <p className="mt-6">
    読み込み中...
  </p>

)}

</div>

    </main>

  );

}