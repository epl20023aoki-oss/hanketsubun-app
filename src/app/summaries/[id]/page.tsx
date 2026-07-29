"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function SummaryPage() {

  const params = useParams();

  const summaryId =
    params.id as string;

  const [name, setName] =
    useState("");

  const [startMonth, setStartMonth] =
    useState("");

  const [endMonth, setEndMonth] =
    useState("");

  const [victory, setVictory] =
    useState("");

  const [
    defeatAndChallenges,
    setDefeatAndChallenges,
  ] = useState("");

  const [testimony, setTestimony] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [submitted, setSubmitted] =
  useState(false);

  const [submittedAt, setSubmittedAt] =
  useState<any>(null);

  const [submitting, setSubmitting] =
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

          if (!currentUser) {
            setLoading(false);
            return;
          }

          const summarySnap =
            await getDoc(
              doc(
                db,
                "users",
                currentUser.uid,
                "summaries",
                summaryId
              )
            );

          if (summarySnap.exists()) {

            const data =
              summarySnap.data();

            setName(
              data.name || ""
            );

            setStartMonth(
              data.startMonth || ""
            );

            setEndMonth(
              data.endMonth || ""
            );

            setVictory(
              data.victory || ""
            );

            setDefeatAndChallenges(
              data.defeatAndChallenges || ""
            );

            setTestimony(
              data.testimony || ""
            );

            setSubmitted(
              data.submitted || false
            );

            setSubmittedAt(
              data.submittedAt || null
            );

          }

          setLoading(false);

        }
      );

    return () => unsubscribe();

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

  const canSubmit =
  victory.trim() !== "" &&
  defeatAndChallenges.trim() !== "" &&
  testimony.trim() !== "";

  if (loading) {

    return (
      <main
        className={`min-h-screen px-4 py-6 ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-xl">
          読み込み中...
        </div>
      </main>
    );

  }

  return (
    <main
      className={`min-h-screen px-4 py-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-xl">

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

        <div className="mt-8">

          <p className="text-sm text-green-600">
            🌱 あしあと
          </p>

          <h1 className="mt-2 text-3xl font-light">
            総括
          </h1>

        </div>

        <div
          className={`mt-8 rounded-3xl p-6 ${
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

          <p className="mt-1 text-lg">
            {name || "-"}
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
            {formatMonth(startMonth)}
            {" ～ "}
            {formatMonth(endMonth)}
          </p>

        </div>

        <div className="mt-8 space-y-4">

          <Link
            href={`/summaries/${summaryId}/victory`}
            className={`block rounded-3xl p-6 transition-all ${
              darkMode
                ? "bg-gray-800/80 hover:bg-gray-800"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="text-lg">
                  ① 勝利点
                </p>

                <p
                  className={`mt-2 text-sm ${
                    victory.trim()
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {victory.trim()
                    ? "✓ 記入済み"
                    : "未記入"}
                </p>
              </div>

              <span className="text-gray-400">
                ＞
              </span>

            </div>

          </Link>

          <Link
            href={`/summaries/${summaryId}/challenges`}
            className={`block rounded-3xl p-6 transition-all ${
              darkMode
                ? "bg-gray-800/80 hover:bg-gray-800"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="text-lg">
                  ② 敗北点・今後の課題
                </p>

                <p
                  className={`mt-2 text-sm ${
                    defeatAndChallenges.trim()
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {defeatAndChallenges.trim()
                    ? "✓ 記入済み"
                    : "未記入"}
                </p>
              </div>

              <span className="text-gray-400">
                ＞
              </span>

            </div>

          </Link>

          <Link
            href={`/summaries/${summaryId}/testimony`}
            className={`block rounded-3xl p-6 transition-all ${
              darkMode
                ? "bg-gray-800/80 hover:bg-gray-800"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-lg">
                  ③ 証し
                </p>

                <p
                  className={`mt-2 text-xs ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  神体験・復帰したみ言や心情などを
                  具体的に記入します
                </p>

                <p
                  className={`mt-2 text-sm ${
                    testimony.trim()
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {testimony.trim()
                    ? "✓ 記入済み"
                    : "未記入"}
                </p>

              </div>

              <span className="text-gray-400">
                ＞
              </span>

            </div>

          </Link>

        </div>

{/* 提出 */}

<div className="mt-10">

  {submitted && (
    <div
      className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
        darkMode
          ? "bg-green-900/30 text-green-300"
          : "bg-green-50 text-green-700"
      }`}
    >
      <span className="font-medium">
        ✅ 提出済み
      </span>

     {submittedAt && (
  <span className="ml-3">
    {submittedAt?.toDate
      ? submittedAt
          .toDate()
          .toLocaleString()
      : submittedAt instanceof Date
      ? submittedAt.toLocaleString()
      : ""}
  </span>
)}
    </div>
  )}

  <button
    disabled={
      !canSubmit ||
      submitting
    }
    onClick={async () => {

      if (!auth.currentUser) {
        return;
      }

      if (!canSubmit) {
        return;
      }

      if (
        submitted &&
        !window.confirm(
          "総括を再提出しますか？提出日時が更新されます。"
        )
      ) {
        return;
      }

      setSubmitting(true);

      try {

        const currentUser =
          auth.currentUser;

        await updateDoc(
          doc(
            db,
            "users",
            currentUser.uid,
            "summaries",
            summaryId
          ),
          {
            submitted: true,
            submittedAt:
              serverTimestamp(),
            updatedAt:
              serverTimestamp(),
          }
        );

        await setDoc(
          doc(
            db,
            "submitted_summaries",
            summaryId
          ),
          {
            uid:
              currentUser.uid,

            summaryId,

            name,

            startMonth,
            endMonth,

            victory,
            defeatAndChallenges,
            testimony,

            submittedAt:
              serverTimestamp(),
          }
        );

        setSubmitted(true);

        setSubmittedAt(
          new Date()
        );

        alert(
          submitted
            ? "総括を再提出しました"
            : "総括を提出しました"
        );

      } catch (error) {

        console.error(
          "総括の提出に失敗しました",
          error
        );

        alert(
          "総括を提出できませんでした"
        );

      } finally {

        setSubmitting(false);

      }

    }}
    className={`w-full rounded-2xl py-4 text-sm font-medium transition-all ${
      canSubmit &&
      !submitting
        ? darkMode
          ? "bg-green-900/40 text-green-300 hover:bg-green-900/60"
          : "bg-green-600 text-white hover:bg-green-700"
        : darkMode
        ? "cursor-not-allowed bg-gray-800 text-gray-600"
        : "cursor-not-allowed bg-gray-200 text-gray-400"
    }`}
  >
    {submitting
      ? "提出中..."
      : submitted
      ? "再提出する"
      : "総括を提出する"}
  </button>

  {!canSubmit && (
    <p
      className={`mt-3 text-center text-xs ${
        darkMode
          ? "text-gray-500"
          : "text-gray-400"
      }`}
    >
      ①〜③をすべて記入すると提出できます
    </p>
  )}

</div>

      </div>
    </main>
  );
}