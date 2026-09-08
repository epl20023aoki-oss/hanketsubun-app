"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type Props = {
  params: Promise<{
    route: string;
  }>;
};

export default function RoutePage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [reflectionComplete, setReflectionComplete] =
    useState(false);
  const [resultsComplete, setResultsComplete] =
    useState(false);
  const [goalsComplete, setGoalsComplete] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const [, month] = currentMonth.split("-");

  // ダークモード設定を読み込む
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }

    setMounted(true);
  }, []);

  // ログイン状態を確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // 路程データ・入力状況を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchRouteData = async () => {
      try {
        // 路程本体
        const routeRef = doc(
          db,
          "users",
          user.uid,
          "team_reports",
          currentMonth,
          "routes",
          `route_${route}`
        );

        const routeSnap = await getDoc(routeRef);

        if (routeSnap.exists()) {
          const data = routeSnap.data();

          setStartDate(data.startDate || "");
          setEndDate(data.endDate || "");
          setSubmitted(data.submitted || false);
        }

        // ① 前路程の振り返り
        const reflectionSnap = await getDoc(
          routeRef
        );

        if (reflectionSnap.exists()) {
          const data = reflectionSnap.data();

          const complete =
            !!data.slogan &&
            !!data.victory &&
            !!data.defeat &&
            !!data.currentState &&
            !!data.changes &&
            !!data.nextSlogan;

          setReflectionComplete(complete);
        }

        // ② 班員ごとの結果
        const resultsSnap = await getDoc(
          doc(
            routeRef,
            "results",
            "members"
          )
        );

        if (resultsSnap.exists()) {
          const data = resultsSnap.data();

          const hasMembers = Object.keys(data).some(
            (key) => key !== "updatedAt"
          );

          setResultsComplete(hasMembers);
        }

        // ③ 次路程の個人目標
        const goalsSnap = await getDoc(
          doc(
            routeRef,
            "goals",
            "members"
          )
        );

        if (goalsSnap.exists()) {
          const data = goalsSnap.data();

          const hasMembers = Object.keys(data).some(
            (key) => key !== "updatedAt"
          );

          setGoalsComplete(hasMembers);
        }
      } catch (error) {
        console.error(
          "路程データの読み込みエラー",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();
  }, [user, currentMonth, route]);

  const formatDate = (date: string) => {
    if (!date) return "";

    const [, m, d] = date.split("-");
    return `${Number(m)}月${Number(d)}日`;
  };

  const allComplete =
    reflectionComplete &&
    resultsComplete &&
    goalsComplete;

  // 提出
  const submitReport = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    if (!allComplete) {
      alert(
        "①〜③をすべて記入してから提出してください"
      );
      return;
    }

    const confirmed = window.confirm(
      submitted
        ? "この路程レポートを修正内容で再提出しますか？"
        : "この路程レポートをスタッフへ提出しますか？"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      // --------------------------------
      // ① 班情報を取得
      // --------------------------------

      const teamReportRef = doc(
        db,
        "users",
        user.uid,
        "team_reports",
        currentMonth
      );

      const teamReportSnap =
        await getDoc(teamReportRef);

      const teamData = teamReportSnap.exists()
        ? teamReportSnap.data()
        : {};

      // --------------------------------
      // ② 路程本体を取得
      // --------------------------------

      const routeRef = doc(
        db,
        "users",
        user.uid,
        "team_reports",
        currentMonth,
        "routes",
        `route_${route}`
      );

      const routeSnap = await getDoc(routeRef);

      const routeData = routeSnap.exists()
        ? routeSnap.data()
        : {};

      // --------------------------------
      // ③ ① 振り返りを取得
      // --------------------------------

      const reflectionSnap = await getDoc(
        routeRef
      );

      const reflectionData =
        reflectionSnap.exists()
          ? reflectionSnap.data()
          : {};

      // --------------------------------
      // ④ ② 班員ごとの結果を取得
      // --------------------------------

      const resultsSnap = await getDoc(
        doc(
          routeRef,
          "results",
          "members"
        )
      );

      const resultsData =
        resultsSnap.exists()
          ? resultsSnap.data()
          : {};

      // --------------------------------
      // ⑤ ③ 次路程の個人目標を取得
      // --------------------------------

      const goalsSnap = await getDoc(
        doc(
          routeRef,
          "goals",
          "members"
        )
      );

      const goalsData =
        goalsSnap.exists()
          ? goalsSnap.data()
          : {};

      // --------------------------------
      // ⑥ 提出日時
      // --------------------------------

      const submittedAt = new Date();

      // --------------------------------
      // ⑦ 本人側に提出済みを保存
      // --------------------------------

      await setDoc(
        routeRef,
        {
          submitted: true,
          submittedAt,
        },
        { merge: true }
      );

      // --------------------------------
      // ⑧ スタッフ確認用データを保存
      // --------------------------------

      const submissionId =
        `${user.uid}_${currentMonth}_route_${route}`;

      await setDoc(
        doc(
          db,
          "submitted_team_reports",
          submissionId
        ),
        {
          uid: user.uid,

          month: currentMonth,

          route: Number(route),

          team:
            teamData.team || "",

          leader:
            teamData.leader || "",

          subLeader:
            teamData.subLeader || "",

          members:
            teamData.members || [],

          startDate:
            routeData.startDate || startDate || "",

          endDate:
            routeData.endDate || endDate || "",

          reflection: {
            slogan:
              reflectionData.slogan || "",

            victory:
              reflectionData.victory || "",

            defeat:
              reflectionData.defeat || "",

            currentState:
              reflectionData.currentState || "",

            changes:
              reflectionData.changes || "",

            nextSlogan:
              reflectionData.nextSlogan || "",
          },

          results: resultsData,

          goals: goalsData,

          submittedAt,
        }
      );

      setSubmitted(true);

      alert(
        submitted
          ? "修正内容を再提出しました"
          : "スタッフへ提出しました"
      );
    } catch (error) {
      console.error(
        "レポート提出エラー",
        error
      );

      alert("提出に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <main
        className={`mx-auto min-h-screen max-w-2xl px-6 py-10 transition-all duration-300 ${
          darkMode
            ? "bg-[#111827] text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <p className="text-sm text-gray-400">
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main
      className={`mx-auto min-h-screen max-w-2xl px-6 py-10 transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Link
        href="/team-reports"
        className={`mb-6 inline-block text-sm transition ${
          darkMode
            ? "text-gray-400 hover:text-gray-200"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        ← 週間班長レポートへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide text-gray-900 dark:text-white">
        {Number(month)}月 第{route}次路程
      </h1>

      <p className="mb-3 text-sm text-gray-400">
        {startDate && endDate
          ? `期間：${formatDate(
              startDate
            )}〜${formatDate(endDate)}`
          : "期間：未設定"}
      </p>

      <Link
        href={`/team-reports/routes/${route}/settings`}
        className={`mb-10 inline-block text-xs ${
          darkMode ? "text-green-400" : "text-green-600"
        }`}
      >
        期間を設定 →
      </Link>

      <div className="space-y-4">
        {/* ① */}
        <Link
          href={`/team-reports/routes/${route}/reflection`}
          className="block"
        >
          <div className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode ? "bg-gray-800/80" : "bg-white"
            }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ① 前路程の振り返り
              </p>

              <span
                className={
                  reflectionComplete
                    ? `text-sm ${darkMode ? "text-green-400" : "text-green-600"}`
                    : "text-sm text-gray-400"
                }
              >
                {reflectionComplete
                  ? "✓ 記入済み"
                  : "未記入"}
              </span>
            </div>

            <p className="mt-3 text-lg leading-8 text-gray-900 dark:text-gray-100">
              班としての歩みを振り返る
            </p>

            <p className={`mt-4 text-xs ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}>
              記入する →
            </p>
          </div>
        </Link>

        {/* ② */}
        <Link
          href={`/team-reports/routes/${route}/results`}
          className="block"
        >
          <div className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode ? "bg-gray-800/80" : "bg-white"
            }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ② 班員ごとの結果
              </p>

              <span
                className={
                  resultsComplete
                    ? `text-sm ${darkMode ? "text-green-400" : "text-green-600"}`
                    : "text-sm text-gray-400"
                }
              >
                {resultsComplete
                  ? "✓ 記入済み"
                  : "未記入"}
              </span>
            </div>

            <p className="mt-3 text-lg leading-8 text-gray-900 dark:text-gray-100">
              班員一人ひとりの結果を記録する
            </p>

            <p className={`mt-4 text-xs ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}>
              記入する →
            </p>
          </div>
        </Link>

        {/* ③ */}
        <Link
          href={`/team-reports/routes/${route}/goals`}
          className="block"
        >
          <div className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode ? "bg-gray-800/80" : "bg-white"
            }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ③ 次路程の個人目標
              </p>

              <span
                className={
                  goalsComplete
                    ? `text-sm ${darkMode ? "text-green-400" : "text-green-600"}`
                    : "text-sm text-gray-400"
                }
              >
                {goalsComplete
                  ? "✓ 記入済み"
                  : "未記入"}
              </span>
            </div>

            <p className="mt-3 text-lg leading-8 text-gray-900 dark:text-gray-100">
              次の路程に向けた目標を記録する
            </p>

            <p className={`mt-4 text-xs ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}>
              記入する →
            </p>
          </div>
        </Link>
      </div>

      {/* 提出 */}
      <section className="mt-8">
        {submitted ? (
          <div className={`rounded-3xl p-6 text-center ${
              darkMode ? "bg-green-950/40" : "bg-green-50"
            }`}>
            <p className={`text-lg ${
              darkMode ? "text-green-300" : "text-green-700"
            }`}>
              ✓ スタッフへ提出済み
            </p>

            <p className={`mt-2 text-sm ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}>
              このレポートは提出されています
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <p className="text-sm text-gray-400">
              レポートの提出
            </p>

            <p className={`mt-3 text-sm leading-7 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              ①〜③をすべて記入すると、
              スタッフへ提出できます。
            </p>

            <button
              type="button"
              onClick={submitReport}
              disabled={
                !allComplete || submitting
              }
              className={`mt-5 w-full rounded-2xl py-4 text-white transition ${
                allComplete
                  ? darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-800 hover:bg-gray-700"
                  : darkMode
                    ? "bg-gray-700"
                    : "bg-gray-300"
              } disabled:opacity-50`}
            >
              {submitting
                ? submitted
                  ? "再提出中..."
                  : "提出中..."
                : submitted
                ? "修正内容を再提出する"
                : allComplete
                ? "スタッフへ提出する"
                : "①〜③を記入してください"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}