"use client";

import { useEffect, useState } from "react";

import { db } from "../lib/firebase";

import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import Link from "next/link";

export default function AdminPage() {

   const router =
    useRouter();

  const [submittedReports,
  setSubmittedReports] =
  useState<any[]>([]);

  const [
  submittedTestimonies,
  setSubmittedTestimonies
] = useState<any[]>([]);

const [
  submittedSummaries,
  setSubmittedSummaries
] = useState<any[]>([]);

const [
  expandedTestimonies,
  setExpandedTestimonies
] = useState<string[]>([]);

  const [selectedMonth,
  setSelectedMonth] =
  useState("");

  const [searchName,
  setSearchName] =
  useState("");

  const [searchTeam,
  setSearchTeam] =
  useState("");

  const [
  activeTab,
  setActiveTab
] = useState("reports");

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

  const auth =
    localStorage.getItem(
      "staffAuth"
    );

  if (!auth) {

    router.push(
      "/manager"
    );

  }

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
const fetchSubmittedTestimonies =
  async () => {

    const snapshot =
      await getDocs(
        collection(
          db,
          "submitted_testimonies"
        )
      );

    const testimonyData =
  snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort(
  (a: any, b: any) =>
    (b.submittedAt?.toDate?.().getTime() || 0) -
    (a.submittedAt?.toDate?.().getTime() || 0)
)

setSubmittedTestimonies(
  testimonyData
);

  };

useEffect(() => {

  const savedMonth =
    localStorage.getItem(
      "adminSelectedMonth"
    );

  if (savedMonth) {

    setSelectedMonth(savedMonth);

  } else {

    setSelectedMonth(
      new Date()
        .toISOString()
        .slice(0, 7)
    );

  }

}, []);

const fetchSubmittedSummaries =
  async () => {

    const snapshot =
      await getDocs(
        collection(
          db,
          "submitted_summaries"
        )
      );

    const summaryData =
      snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort(
          (a: any, b: any) =>
            (b.submittedAt
              ?.toDate?.()
              .getTime() || 0) -
            (a.submittedAt
              ?.toDate?.()
              .getTime() || 0)
        );

    setSubmittedSummaries(
      summaryData
    );

  };

useEffect(() => {
  fetchSubmittedReports();
  fetchSubmittedTestimonies();
  fetchSubmittedSummaries();

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

  <div>

    <div className="text-3xl">
      🍃
    </div>

    <h1 className="text-2xl font-bold">
      あしあと
    </h1>

    <p className="text-sm text-gray-500">
      月末レポート管理
    </p>

<div
  className={`mb-6 flex rounded-2xl p-1 ${
    darkMode
      ? "bg-gray-800"
      : "bg-gray-100"
  }`}
>

  <button
    onClick={() =>
      setActiveTab("reports")
    }
    className={`flex-1 rounded-xl px-3 py-2 text-sm ${
      activeTab === "reports"
        ? darkMode
          ? "bg-gray-700 text-white"
          : "bg-white shadow-sm"
        : ""
    }`}
  >
    👣 月末レポート
  </button>

  <button
    onClick={() =>
      setActiveTab("testimonies")
    }
    className={`flex-1 rounded-xl px-3 py-2 text-sm ${
      activeTab === "testimonies"
        ? darkMode
          ? "bg-gray-700 text-white"
          : "bg-white shadow-sm"
        : ""
    }`}
  >
    🌱 証一覧
  </button>

  <button
    onClick={() =>
      setActiveTab("summaries")
    }
    className={`flex-1 rounded-xl px-3 py-2 text-sm ${
      activeTab === "summaries"
        ? darkMode
          ? "bg-gray-700 text-white"
          : "bg-white shadow-sm"
        : ""
    }`}
  >
    📖 総括
  </button>

</div>

  </div>

  <button
    onClick={() => {

      localStorage.removeItem(
        "staffAuth"
      );

      router.push(
        "/manager"
      );

    }}
    className={`text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-500"
    }`}
  >
    ログアウト
  </button>

</div>

     
<hr className="my-8" />

<div className="mt-6 mb-6 flex flex-col gap-4">

  <div className="flex-1">

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
     onChange={(e) => {

  setSelectedMonth(
    e.target.value
  );

  localStorage.setItem(
    "adminSelectedMonth",
    e.target.value
  );

}}
      className={`w-full rounded-xl border px-4 py-2 ${
        darkMode
          ? "border-gray-700 bg-gray-800 text-white"
          : "border-gray-300 bg-white"
      }`}
    />

  </div>

  <div className="flex-1">

    <label
      className={`mb-2 block text-sm ${
        darkMode
          ? "text-gray-300"
          : "text-gray-600"
      }`}
    >
      班検索
    </label>

    <input
      type="text"
      value={searchTeam}
      onChange={(e) =>
        setSearchTeam(
          e.target.value
        )
      }
      placeholder="班名を入力"
      className={`w-full rounded-xl border px-4 py-2 ${
        darkMode
          ? "border-gray-700 bg-gray-800 text-white"
          : "border-gray-300 bg-white"
      }`}
    />

  </div>

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

{activeTab === "reports" && (

<>

<p
  className={`mb-4 text-sm ${
    darkMode
      ? "text-gray-300"
      : "text-gray-600"
  }`}
>
  提出者数：
  <span className="font-semibold">
    {submittedReports.length}名
  </span>
</p>

{submittedReports
  .filter((report) => {

    const matchName =
      report.name
        ?.includes(searchName);

    const matchTeam =
      report.team
        ?.includes(searchTeam);

    return (
      matchName &&
      matchTeam
    );

  })
  .map(
    (report) => (

      <Link
        key={report.id}
        href={`/monthly-reports/pdf?uid=${report.uid}&month=${report.month}`}
        className={`mb-3 block rounded-3xl border p-5 transition-all hover:scale-[1.01] ${
          darkMode
            ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
            : "border-gray-100 bg-white hover:bg-gray-50"
        }`}
      >

        <div className="flex items-center justify-between">

         <div>

  <div className="flex items-center gap-2">

    <span>
      👣
    </span>

    <span className="font-semibold">
      {report.name}
    </span>

    <span
      className={`rounded-full px-2 py-1 text-xs ${
        darkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {report.team}
    </span>

  </div>

</div>

          <div
            className={`text-xl ${
              darkMode
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            ›
          </div>

        </div>

        <div
          className={`mt-3 text-xs ${
            darkMode
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
        提出：
  {report.submittedAt?.toDate
    ? report.submittedAt
        .toDate()
        .toLocaleString()
    : "-"}
</div>

      </Link>

    )
)}

</>

)}

{activeTab === "testimonies" && (

  <div>

      {submittedTestimonies.length === 0 && (

      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >
        まだ証の提出はありません
      </p>

    )}

   {submittedTestimonies
  .filter((item) => {

  const matchName =
    item.name?.includes(searchName);

  const matchTeam =
    item.team?.includes(searchTeam);

  const matchMonth =
    item.date?.startsWith(
      selectedMonth
    );

  return (
    matchName &&
    matchTeam &&
    matchMonth
  );

})

  .map(
    (item) => (

        <div
          key={item.id}
          className={`mb-3 rounded-3xl border p-5 ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-100 bg-white"
          }`}
        >

          <div className="mb-3 flex items-center gap-2">

            <span>
  🌱
</span>

            <span className="font-semibold">
              {item.name}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.team}
            </span>

          </div>

          <>
  <p
    className={`whitespace-pre-wrap text-sm ${
      darkMode
        ? "text-gray-300"
        : "text-gray-700"
    }`}
  >
    {expandedTestimonies.includes(item.id)
      ? item.testimony
      : item.testimony.length > 100
      ? item.testimony.slice(0, 100) + "..."
      : item.testimony}
  </p>

  {item.testimony.length > 100 && (

    <button
      onClick={() => {

        if (
          expandedTestimonies.includes(
            item.id
          )
        ) {

          setExpandedTestimonies(
            expandedTestimonies.filter(
              (id) =>
                id !== item.id
            )
          );

        } else {

          setExpandedTestimonies([
            ...expandedTestimonies,
            item.id,
          ]);

        }

      }}
     className={`mt-2 text-sm font-medium ${
  darkMode
    ? "text-green-300"
    : "text-green-600"
}`}
    >
      {expandedTestimonies.includes(
        item.id
      )
        ? "▲ 閉じる"
        : "▼ 続きを読む"}
    </button>

  )}
</>

          <div
            className={`mt-3 text-xs ${
              darkMode
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {item.submittedAt?.toDate
              ? item.submittedAt
                  .toDate()
                  .toLocaleString()
              : "-"}
          </div>

        </div>

      )
    )}

  </div>

)}

{activeTab === "summaries" && (

  <div>

    {submittedSummaries.length === 0 && (

      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >
        まだ総括の提出はありません
      </p>

    )}

    {submittedSummaries
      .filter((item) => {

        const matchName =
          item.name?.includes(
            searchName
          );

        return matchName;

      })
      .map((item) => (

        <Link
          key={item.id}
          href={`/admin/summaries/${item.id}`}
          className={`mb-3 block rounded-3xl border p-5 transition-all hover:scale-[1.01] ${
            darkMode
              ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
              : "border-gray-100 bg-white hover:bg-gray-50"
          }`}
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <span>
                  📖
                </span>

                <span className="font-semibold">
                  {item.name}
                </span>

              </div>

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                }`}
              >
                {item.startMonth
                  ? `${item.startMonth.replace(
                      "-",
                      "年"
                    )}月`
                  : "-"}
                {" ～ "}
                {item.endMonth
                  ? `${item.endMonth.replace(
                      "-",
                      "年"
                    )}月`
                  : "-"}
              </p>

              <p
                className={`mt-2 text-xs ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                提出：
                {item.submittedAt?.toDate
                  ? item.submittedAt
                      .toDate()
                      .toLocaleString()
                  : "-"}
              </p>

            </div>

            <div
              className={`text-xl ${
                darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              ›
            </div>

          </div>

        </Link>

      ))}

  </div>

)}

  </div>

    </main>
  );

}