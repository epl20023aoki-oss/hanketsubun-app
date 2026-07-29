"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../lib/firebase";

export default function AdminSummaryPage() {

  const params = useParams();

  const router = useRouter();

  const summaryId =
    params.id as string;

  const [summary, setSummary] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {

    const staffAuth =
      localStorage.getItem(
        "staffAuth"
      );

    if (!staffAuth) {

      router.push(
        "/manager"
      );

      return;

    }

    const savedMode =
      localStorage.getItem(
        "darkMode"
      );

    if (savedMode) {

      setDarkMode(
        JSON.parse(savedMode)
      );

    }

  }, [router]);

  useEffect(() => {

    const fetchSummary =
      async () => {

        try {

          const snapshot =
            await getDoc(
              doc(
                db,
                "submitted_summaries",
                summaryId
              )
            );

          if (snapshot.exists()) {

            setSummary({
              id: snapshot.id,
              ...snapshot.data(),
            });

          }

        } catch (error) {

          console.error(
            "総括の取得に失敗しました",
            error
          );

        } finally {

          setLoading(false);

        }

      };

    fetchSummary();

  }, [summaryId]);

  const formatMonth = (
    month: string
  ) => {

    if (!month) return "-";

    const [year, monthNumber] =
      month.split("-");

    return `${year}年${Number(
      monthNumber
    )}月`;

  };

  if (loading) {

    return (
      <main
        className={`min-h-screen p-6 ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          読み込み中...
        </div>
      </main>
    );

  }

  if (!summary) {

    return (
      <main
        className={`min-h-screen p-6 ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-3xl">

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="text-sm text-gray-400"
          >
            ← 管理画面へ戻る
          </button>

          <p className="mt-8">
            総括が見つかりません
          </p>

        </div>
      </main>
    );

  }

  return (
    <main
      className={`min-h-screen p-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >

      <div className="mx-auto max-w-3xl">

        <button
          onClick={() =>
            router.push("/admin")
          }
          className={`text-sm ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          ← 総括一覧へ戻る
        </button>

        <div className="mt-8">

          <p className="text-sm text-green-600">
            📖 あしあと
          </p>

          <h1 className="mt-2 text-3xl font-light">
            総括
          </h1>

        </div>

        {/* 基本情報 */}

        <div
          className={`mt-8 rounded-3xl p-6 ${
            darkMode
              ? "bg-gray-800"
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

          <p className="mt-1 text-lg font-medium">
            {summary.name || "-"}
          </p>

          <p
            className={`mt-6 text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            期間
          </p>

          <p className="mt-1 text-lg">
            {formatMonth(
              summary.startMonth
            )}
            {" ～ "}
            {formatMonth(
              summary.endMonth
            )}
          </p>

          <p
            className={`mt-6 text-xs ${
              darkMode
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            提出：
            {summary.submittedAt?.toDate
              ? summary.submittedAt
                  .toDate()
                  .toLocaleString()
              : "-"}
          </p>

        </div>

        {/* ① 勝利点 */}

        <section
          className={`mt-6 rounded-3xl p-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-gray-50"
          }`}
        >

          <h2 className="text-lg font-medium">
            ① 勝利点
          </h2>

          <p
            className={`mt-4 whitespace-pre-wrap leading-8 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {summary.victory || "-"}
          </p>

        </section>

        {/* ② 敗北点 */}

        <section
          className={`mt-6 rounded-3xl p-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-gray-50"
          }`}
        >

          <h2 className="text-lg font-medium">
            ② 敗北点・今後の課題
          </h2>

          <p
            className={`mt-4 whitespace-pre-wrap leading-8 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {summary.defeatAndChallenges || "-"}
          </p>

        </section>

        {/* ③ 証し */}

        <section
          className={`mb-10 mt-6 rounded-3xl p-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-gray-50"
          }`}
        >

          <h2 className="text-lg font-medium">
            ③ 証し
          </h2>

          <p
            className={`mt-2 text-xs ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            神体験・復帰したみ言や心情
          </p>

          <p
            className={`mt-4 whitespace-pre-wrap leading-8 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {summary.testimony || "-"}
          </p>

        </section>

      </div>

    </main>
  );
}