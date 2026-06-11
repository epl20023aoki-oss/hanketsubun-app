"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  auth,
  db,
} from "../../lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function HistoryPage() {

  const [reports, setReports] =
    useState<any[]>([]);

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

          if (!user) return;

          const snapshot =
            await getDocs(
              collection(
                db,
                "users",
                user.uid,
                "monthly_reports"
              )
            );

          const reports =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

          setReports(reports);

        }
      );

    return () =>
      unsubscribe();

  }, []);

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

  <div className="mx-auto max-w-2xl">

<div className="mb-8 flex items-center justify-between">

  <Link
    href="/"
    className={`text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-400"
    }`}
  >
    ← ホームへ戻る
  </Link>

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

      <h1 className="mb-8 text-3xl font-bold">
        月末レポート履歴
      </h1>

<div className="space-y-4">

  {reports.map(
    (report) => (

      <Link
        key={report.id}
        href={`/monthly-reports/pdf?month=${report.id}`}
      className={`block rounded-2xl border p-4 transition-colors ${
  darkMode
    ? "border-gray-700 hover:bg-gray-800"
    : "border-gray-200 hover:bg-gray-50"
}`}
      >

        <div className="font-bold">
          {report.id}
        </div>

       <div
  className={`text-sm ${
    darkMode
      ? "text-gray-300"
      : "text-gray-500"
  }`}
>
  {report.name}
</div>

      </Link>

    )
  )}

</div>

</div>

    </main>
  );

}