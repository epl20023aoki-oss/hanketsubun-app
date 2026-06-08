"use client";

import { useEffect, useState } from "react";

import { auth, db } from "../lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
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

  const [name, setName] =
    useState("");

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user)
            return;

          const snapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );

          if (
            snapshot.exists()
          ) {

            setName(
              snapshot.data()
                .name || ""
            );

          }

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

      <p className="mt-4">
        管理者：
        {name}
      </p>

<hr className="my-8" />

<p className="mb-4 text-xl">
  提出状況
</p>

{submittedReports.map(
  (report) => (

    <div
      key={report.id}
      className="mb-4 rounded-2xl border p-4"
    >

      <p>
        名前：
        {report.name}
      </p>

      <p>
        班：
        {report.team}
      </p>

      <p>
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
>
  詳細を見る
</Link>

    </div>

  )
)}

  </div>

    </main>
  );

}