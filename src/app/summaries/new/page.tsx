"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";

export default function NewSummaryPage() {
  const router = useRouter();

  const [userId, setUserId] =
    useState("");

  const [name, setName] =
    useState("");

  const [startMonth, setStartMonth] =
    useState("");

  const [endMonth, setEndMonth] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {

    const savedMode =
      localStorage.getItem(
        "darkMode"
      );

    if (savedMode) {
      setDarkMode(
        JSON.parse(savedMode)
      );
    }

  }, []);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

         if (!currentUser) return;

          setUserId(currentUser.uid);

          const profileSnap =
             await getDoc(
              doc(
                db,
                "users",
                currentUser.uid
              )
            );

          if (profileSnap.exists()) {

            const profile =
              profileSnap.data();

            setName(
              profile.name || ""
            );

          }

        }
      );

    return () => unsubscribe();

  }, []);

  return (
    <main
      className={`min-h-screen px-4 py-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-xl">

        <div className="mb-8">

          <Link
            href="/summaries"
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            ← 総括一覧へ戻る
          </Link>

        </div>

        <div className="mb-8">

          <p className="text-sm text-green-600">
            🌱 あしあと
          </p>

          <h1 className="mt-2 text-3xl font-light">
            新しい総括
          </h1>

          <p
            className={`mt-2 text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            振り返る期間を選んでください
          </p>

        </div>

        <div
          className={`rounded-3xl p-6 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >

          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            名前
          </p>

          <p className="mt-2 text-lg">
            {name || "読み込み中..."}
          </p>

          <div className="mt-8">

            <p
              className={`mb-3 text-sm ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              期間
            </p>

            <div className="flex items-center gap-3">

              <input
                type="month"
                value={startMonth}
                onChange={(e) =>
                  setStartMonth(
                    e.target.value
                  )
                }
                className={`min-w-0 flex-1 rounded-2xl border p-3 ${
                  darkMode
                    ? "border-gray-700 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />

              <span
                className={
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              >
                ～
              </span>

              <input
                type="month"
                value={endMonth}
                onChange={(e) =>
                  setEndMonth(
                    e.target.value
                  )
                }
                className={`min-w-0 flex-1 rounded-2xl border p-3 ${
                  darkMode
                    ? "border-gray-700 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />

            </div>

          </div>

          <button
  onClick={async () => {

    if (
      !userId ||
      !startMonth ||
      !endMonth
    ) {
      return;
    }

    if (startMonth > endMonth) {
      alert(
        "終了月は開始月以降を選んでください"
      );
      return;
    }

    try {

      const summaryRef =
        await addDoc(
          collection(
            db,
            "users",
            userId,
            "summaries"
          ),
          {
            name,
            startMonth,
            endMonth,

            victory: "",
            defeatAndChallenges: "",
            testimony: "",

            submitted: false,
            submittedAt: null,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      router.push(
        `/summaries/${summaryRef.id}`
      );

    } catch (error) {

      console.error(
        "総括の作成に失敗しました",
        error
      );

      alert(
        "総括を作成できませんでした"
      );

    }

  }}
  disabled={
    !userId ||
    !startMonth ||
    !endMonth
  }
  className={`mt-8 w-full rounded-2xl py-4 font-medium transition-all ${
    userId &&
    startMonth &&
    endMonth
      ? darkMode
        ? "bg-green-900/40 text-green-300"
        : "bg-green-600 text-white"
      : darkMode
      ? "bg-gray-700 text-gray-500"
      : "bg-gray-200 text-gray-400"
  }`}
>
  この期間で総括を作る
</button>

        </div>

      </div>
    </main>
  );
}
