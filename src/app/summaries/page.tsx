"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function SummariesPage() {

  const [darkMode, setDarkMode] =
    useState(false);

  const [summaries, setSummaries] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

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

          if (!currentUser) {
            setLoading(false);
            return;
          }

          try {

            const snapshot =
              await getDocs(
                collection(
                  db,
                  "users",
                  currentUser.uid,
                  "summaries"
                )
              );

            const summaryData =
              snapshot.docs
                .map((document) => ({
                  id: document.id,
                  ...document.data(),
                }))
                .sort(
                  (a: any, b: any) => {

                    const aTime =
                      a.createdAt
                        ?.toDate?.()
                        ?.getTime?.() || 0;

                    const bTime =
                      b.createdAt
                        ?.toDate?.()
                        ?.getTime?.() || 0;

                    return bTime - aTime;

                  }
                );

            setSummaries(
              summaryData
            );

          } catch (error) {

            console.error(
              "総括一覧の取得に失敗しました",
              error
            );

          } finally {

            setLoading(false);

          }

        }
      );

    return () => unsubscribe();

  }, []);

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

  return (
    <main
      className={`min-h-screen px-4 py-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-xl">

        {/* 上部 */}
        <div className="mb-8">

          <Link
            href="/"
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            ← ホームへ戻る
          </Link>

        </div>

        {/* タイトル */}
        <div className="mb-8">

          <p className="text-sm text-green-600">
            🌱 あしあと
          </p>

          <h1 className="mt-2 text-3xl font-light">
            総括
          </h1>

          <p
            className={`mt-2 text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            これまでの歩みを振り返ります
          </p>

        </div>

        {/* 新規作成 */}
        <Link href="/summaries/new">

          <div
            className={`mb-8 cursor-pointer rounded-3xl border p-6 transition-all ${
              darkMode
                ? "border-green-900 bg-green-900/20 hover:bg-green-900/30"
                : "border-green-100 bg-green-50 hover:bg-green-100"
            }`}
          >

            <p
              className={`text-lg font-medium ${
                darkMode
                  ? "text-green-300"
                  : "text-green-700"
              }`}
            >
              ＋ 新しい総括を作る
            </p>

            <p
              className={`mt-2 text-sm ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              振り返る期間を選んで作成します
            </p>

          </div>

        </Link>

        {/* 一覧 */}
        <section>

          <h2 className="mb-4 text-lg font-medium">
            これまでの総括
          </h2>

          {loading ? (

            <p
              className={`text-sm ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              読み込み中...
            </p>

          ) : summaries.length === 0 ? (

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
                まだ総括はありません
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {summaries.map(
                (summary) => (

                  <Link
                    key={summary.id}
                    href={`/summaries/${summary.id}`}
                    className="block"
                  >

                    <div
                      className={`rounded-3xl p-6 shadow-sm transition-all ${
                        darkMode
                          ? "bg-gray-800/80 hover:bg-gray-800"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-lg">
                            {formatMonth(
                              summary.startMonth
                            )}
                            {" ～ "}
                            {formatMonth(
                              summary.endMonth
                            )}
                          </p>

                         <div className="mt-2 flex items-center gap-4">

  <p
    className={`text-sm ${
      summary.submitted
        ? darkMode
          ? "text-green-400"
          : "text-green-600"
        : darkMode
        ? "text-yellow-300"
        : "text-yellow-600"
    }`}
  >
    {summary.submitted
      ? "✅ 提出済み"
      : "📝 作成中"}
  </p>

  {!summary.submitted && (
    <button
      onClick={async (e) => {

        e.preventDefault();
        e.stopPropagation();

        const confirmed =
          window.confirm(
            "この総括を削除しますか？\n削除した総括は元に戻せません。"
          );

        if (!confirmed) return;

        const currentUser =
          auth.currentUser;

        if (!currentUser) return;

        try {

          await deleteDoc(
            doc(
              db,
              "users",
              currentUser.uid,
              "summaries",
              summary.id
            )
          );

          setSummaries(
            (current) =>
              current.filter(
                (item) =>
                  item.id !== summary.id
              )
          );

        } catch (error) {

          console.error(
            "総括の削除に失敗しました",
            error
          );

          alert(
            "総括を削除できませんでした"
          );

        }

      }}
      className={`text-xs ${
        darkMode
          ? "text-red-400"
          : "text-red-500"
      }`}
    >
      削除
    </button>
  )}

</div>

                          {summary.submittedAt && (
                            <p
                              className={`mt-1 text-xs ${
                                darkMode
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {summary.submittedAt
                                ?.toDate?.()
                                ?.toLocaleString?.() ||
                                ""}
                            </p>
                          )}

                        </div>

                        <span className="text-gray-400">
                          ＞
                        </span>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}