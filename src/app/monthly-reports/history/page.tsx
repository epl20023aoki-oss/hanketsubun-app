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

  return (
    <main className="mx-auto max-w-2xl p-6">

<div className="mb-8 flex items-center justify-between">

  <Link
    href="/"
    className="text-sm text-gray-400"
  >
    ← ホームへ戻る
  </Link>


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
        target="_blank"
        className="block rounded-2xl border p-4 hover:bg-gray-50"
      >

        <div className="font-bold">
          {report.id}
        </div>

        <div className="text-sm text-gray-500">
          {report.name}
        </div>

      </Link>

    )
  )}

</div>

    </main>
  );

}