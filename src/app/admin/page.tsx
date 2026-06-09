"use client";

import { useEffect, useState } from "react";

import { auth, db } from "../lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import Link from "next/link";

export default function AdminPage() {

  const [submittedReports,
  setSubmittedReports] =
  useState<any[]>([]);

  const [selectedMonth,
  setSelectedMonth] =
  useState(
    new Date()
      .toISOString()
      .slice(0, 7)
  );

  const [searchName,
  setSearchName] =
  useState("");

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

      if (!user)
        return;

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


  const fetchSubmittedReports =
  async () => {

   if (!selectedMonth) {
  setSubmittedReports([]);
  return;
} 

    const snapshot =
      await getDocs(
        collection(
          db,
          "submitted_reports",
          selectedMonth,
          "users"
        )
      );

    setSubmittedReports(
      snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      )
    );

  };

  useEffect(() => {

  fetchSubmittedReports();

}, [selectedMonth]);

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
    href="/"
    className="text-sm text-gray-400"
  >
    ← ホームへ戻る
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
        スタッフ管理
      </h1>

     
<hr className="my-8" />

<div className="mt-6 mb-6">

  <label
    className={`mb-2 block text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-600"
    }`}
  >
    対象月
  </label>

  <input
    type="month"
    value={selectedMonth}
    onChange={(e) =>
      setSelectedMonth(
        e.target.value
      )
    }
    className={`rounded-xl border px-4 py-2 ${
      darkMode
        ? "border-gray-700 bg-gray-800 text-white"
        : "border-gray-300 bg-white"
    }`}
  />

</div>

<div className="mb-6">

  <label
    className={`mb-2 block text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-600"
    }`}
  >
    名前検索
  </label>

  <input
    type="text"
    value={searchName}
    onChange={(e) =>
      setSearchName(
        e.target.value
      )
    }
    placeholder="名前を入力"
    className={`w-full rounded-xl border px-4 py-2 ${
      darkMode
        ? "border-gray-700 bg-gray-800 text-white"
        : "border-gray-300 bg-white"
    }`}
  />

</div>

<p className="mb-4 text-xl">
  提出状況
</p>

{submittedReports
  .filter((report) =>
    report.name
      ?.includes(searchName)
  )
  .map(
  (report) => (

   <div
  key={report.id}
  className={`mb-4 rounded-2xl border p-4 transition-colors ${
    darkMode
      ? "border-gray-700 bg-gray-800"
      : "border-gray-200 bg-white"
  }`}
>

      <p className="font-semibold">
  名前：{report.name}
</p>

    <p
  className={`${
    darkMode
      ? "text-gray-300"
      : "text-gray-600"
  }`}
>
  班：{report.team}
</p>

     <p
  className={`text-sm ${
    darkMode
      ? "text-gray-400"
      : "text-gray-500"
  }`}
>
  提出日時：
        {report.submittedAt?.toDate
          ? report.submittedAt
              .toDate()
              .toLocaleString()
          : "-"
        }
      </p>

<Link
  href={`/monthly-reports/pdf?uid=${report.uid}&month=${report.month}`}
  className={`mt-3 inline-block text-sm font-medium ${
    darkMode
      ? "text-blue-300"
      : "text-blue-600"
  }`}
>
  詳細を見る →
</Link>

    </div>

  )
)}

  </div>

    </main>
  );

}