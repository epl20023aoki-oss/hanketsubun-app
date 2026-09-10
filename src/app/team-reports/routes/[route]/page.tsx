"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import generatePDF from "jspdf-html2canvas";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
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

  const [inputUrl, setInputUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  // URLから対象月を取得
  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);

  const [, month] = selectedMonth.split("-");

  // URLのmonthを読み込む
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const monthParam = params.get("month");

    if (monthParam) {
      setSelectedMonth(monthParam);
    }
  }, []);

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
        setLoading(true);

        // 路程本体
        const routeRef = doc(
          db,
          "users",
          user.uid,
          "team_reports",
          selectedMonth,
          "routes",
          `route_${route}`
        );

        const routeSnap = await getDoc(routeRef);

        if (routeSnap.exists()) {
          const data = routeSnap.data();

          setStartDate(data.startDate || "");
          setEndDate(data.endDate || "");
          setSubmitted(data.submitted || false);
        } else {
          setStartDate("");
          setEndDate("");
          setSubmitted(false);
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
        } else {
          setReflectionComplete(false);
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
        } else {
          setResultsComplete(false);
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
        } else {
          setGoalsComplete(false);
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
  }, [user, selectedMonth, route]);

  const formatDate = (date: string) => {
    if (!date) return "";

    const [, m, d] = date.split("-");
    return `${Number(m)}月${Number(d)}日`;
  };

  const allComplete =
    reflectionComplete &&
    resultsComplete &&
    goalsComplete;

  // 班員入力用の共有データを作成し、共有URLを発行
  const createInputUrl = async () => {
    if (typeof window === "undefined" || !user) return;

    try {
      // 班情報を取得
      const teamReportRef = doc(
        db,
        "users",
        user.uid,
        "team_reports",
        selectedMonth
      );

      const teamReportSnap = await getDoc(teamReportRef);

      if (!teamReportSnap.exists()) {
        alert("班員構成が登録されていません");
        return;
      }

      const teamData = teamReportSnap.data();

      // 共有用IDを生成
      const shareRef = doc(
        collection(db, "team_report_inputs")
      );

      // 共有入力ページが参照するデータを保存
      await setDoc(shareRef, {
        month: selectedMonth,
        route: Number(route),
        team: teamData.team || "",
        leader: teamData.leader || "",
        subLeader: teamData.subLeader || "",
        members: teamData.members || [],
        startDate,
        endDate,
        createdBy: user.uid,
        createdAt: new Date(),
      });

      const url = `${window.location.origin}/team-reports/input/${shareRef.id}`;
      setInputUrl(url);
      setUrlCopied(false);
    } catch (error) {
      console.error("共有入力URL作成エラー", error);
      alert("共有入力URLの作成に失敗しました");
    }
  };

  const copyInputUrl = async () => {
    if (!inputUrl) return;

    try {
      await navigator.clipboard.writeText(inputUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      console.error("URLコピーエラー", error);
      alert("URLのコピーに失敗しました");
    }
  };

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
        selectedMonth
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
        selectedMonth,
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

      // 月・UIDの親ドキュメントを作成
      await setDoc(
        doc(db, "submitted_team_reports", selectedMonth),
        { month: selectedMonth },
        { merge: true }
      );

      await setDoc(
        doc(
          db,
          "submitted_team_reports",
          selectedMonth,
          "users",
          user.uid
        ),
        {
          uid: user.uid,
          month: selectedMonth,
        },
        { merge: true }
      );

      await setDoc(
        doc(
          db,
          "submitted_team_reports",
          selectedMonth,
          "users",
          user.uid,
          "routes",
          String(route)
        ),
        {
          uid: user.uid,

          month: selectedMonth,

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
        href={`/team-reports?month=${selectedMonth}`}
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
        href={`/team-reports/routes/${route}/settings?month=${selectedMonth}`}
        className={`mb-4 inline-block text-xs ${
          darkMode
            ? "text-green-400"
            : "text-green-600"
        }`}
      >
        期間を設定 →
      </Link>

      {/* 班員への入力依頼 */}
      <section className="mb-10">
        <div
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-white"
          }`}
        >
          <p className="text-sm text-gray-400">
            班員への入力依頼
          </p>

          <p
            className={`mt-3 text-sm leading-7 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            班員みんなで入力できる共有URLを作成します。
            作成したURLをLINEなどで班員に共有してください。
          </p>

          <button
            type="button"
            onClick={createInputUrl}
            className={`mt-4 w-full rounded-2xl py-3 text-sm text-white transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            📋 班員への入力依頼URLを作成する
          </button>

          {inputUrl && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-gray-400">
                班員共有用URL
              </p>

              <div
                className={`rounded-2xl p-3 text-xs break-all ${
                  darkMode
                    ? "bg-gray-900 text-gray-300"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {inputUrl}
              </div>

              <button
                type="button"
                onClick={copyInputUrl}
                className={`mt-3 w-full rounded-2xl py-3 text-sm transition ${
                  darkMode
                    ? "bg-green-900/40 text-green-300 hover:bg-green-900/60"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {urlCopied
                  ? "✓ コピーしました"
                  : "URLをコピーする"}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-4">
        {/* ① */}
        <Link
          href={`/team-reports/routes/${route}/reflection?month=${selectedMonth}`}
          className="block"
        >
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ① 前路程の振り返り
              </p>

              <span
                className={
                  reflectionComplete
                    ? `text-sm ${
                        darkMode
                          ? "text-green-400"
                          : "text-green-600"
                      }`
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

            <p
              className={`mt-4 text-xs ${
                darkMode
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              記入する →
            </p>
          </div>
        </Link>

        {/* ② */}
        <Link
          href={`/team-reports/routes/${route}/results?month=${selectedMonth}`}
          className="block"
        >
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ② 班員ごとの結果
              </p>

              <span
                className={
                  resultsComplete
                    ? `text-sm ${
                        darkMode
                          ? "text-green-400"
                          : "text-green-600"
                      }`
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

            <p
              className={`mt-4 text-xs ${
                darkMode
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              記入する →
            </p>
          </div>
        </Link>

        {/* ③ */}
        <Link
          href={`/team-reports/routes/${route}/goals?month=${selectedMonth}`}
          className="block"
        >
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                ③ 次路程の個人目標
              </p>

              <span
                className={
                  goalsComplete
                    ? `text-sm ${
                        darkMode
                          ? "text-green-400"
                          : "text-green-600"
                      }`
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

            <p
              className={`mt-4 text-xs ${
                darkMode
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              記入する →
            </p>
          </div>
        </Link>
      </div>

      {/* 提出 */}
      <section className="mt-8">
        {submitted ? (
          <div
            className={`rounded-3xl p-6 text-center ${
              darkMode
                ? "bg-green-950/40"
                : "bg-green-50"
            }`}
          >
            <p
              className={`text-lg ${
                darkMode
                  ? "text-green-300"
                  : "text-green-700"
              }`}
            >
              ✓ スタッフへ提出済み
            </p>

            <p
              className={`mt-2 text-sm ${
                darkMode
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              このレポートは提出されています
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href={`/team-reports/pdf/${encodeURIComponent(`${selectedMonth}|${user?.uid}|${route}`)}`}
                target="_blank"
                className={`rounded-2xl py-3 text-sm transition ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                }`}
              >
                📄 PDF
              </Link>

              <button
                type="button"
                disabled={sharingPdf}
                onClick={async () => {
                  if (
                    typeof window === "undefined" ||
                    !user ||
                    sharingPdf
                  )
                    return;

                  try {
                    setSharingPdf(true);

                    const pdfUrl = `/team-reports/pdf/${encodeURIComponent(`${selectedMonth}|${user.uid}|${route}`)}`;

                    // PDF表示ページを一時的に読み込み、画面に表示された内容をPDF化する
                    const iframe =
                      document.createElement("iframe");
                    iframe.src = pdfUrl;
                    iframe.style.position = "fixed";
                    iframe.style.left = "-10000px";
                    iframe.style.top = "0";
                    iframe.style.width = "794px";
                    iframe.style.height = "1123px";
                    iframe.style.border = "0";
                    iframe.style.background = "#ffffff";

                    document.body.appendChild(iframe);

                    await new Promise<void>(
                      (resolve, reject) => {
                        const timeout =
                          window.setTimeout(() => {
                            reject(
                              new Error(
                                "PDFページの読み込みがタイムアウトしました"
                              )
                            );
                          }, 15000);

                        iframe.onload = () => {
                          window.clearTimeout(timeout);
                          resolve();
                        };

                        iframe.onerror = () => {
                          window.clearTimeout(timeout);
                          reject(
                            new Error(
                              "PDFページの読み込みに失敗しました"
                            )
                          );
                        };
                      }
                    );

                    // PDFページ内の本文が描画されるまで少し待つ
                    await new Promise((resolve) =>
                      setTimeout(resolve, 800)
                    );

                    const iframeDocument =
                      iframe.contentDocument ||
                      iframe.contentWindow?.document;

                    if (!iframeDocument) {
                      throw new Error(
                        "PDFページを取得できませんでした"
                      );
                    }

                    const target =
                      iframeDocument.querySelector(
                        "main"
                      ) ||
                      iframeDocument.body;

                    if (!target) {
                      throw new Error(
                        "PDF化する内容が見つかりませんでした"
                      );
                    }

                    // PDFに含めない操作ボタンなどを一時的に非表示にする
                    const pdfHideElements =
                      iframeDocument.querySelectorAll(
                        ".pdf-hide"
                      );

                    pdfHideElements.forEach(
                      (element) => {
                        (
                          element as HTMLElement
                        ).style.display = "none";
                      }
                    );

                    const pdf = await generatePDF(
                      target as HTMLElement,
                      {
                        margin: {
                          top: 10,
                          right: 10,
                          bottom: 10,
                          left: 10,
                        },
                        html2canvas: {
                          scale: 2,
                          useCORS: true,
                          backgroundColor: "#ffffff",
                        },
                        jsPDF: {
                          unit: "mm",
                          format: "a4",
                          orientation: "portrait",
                        },
                      }
                    );

                    document.body.removeChild(iframe);

                    const blob = pdf.output("blob");
                    const file = new File(
                      [blob],
                      `${month}月_第${route}次路程_週間班長レポート.pdf`,
                      {
                        type: "application/pdf",
                      }
                    );

                    // ファイル共有に対応しているスマートフォン等では、
                    // PDFそのものを共有する
                    if (
                      navigator.share &&
                      navigator.canShare &&
                      navigator.canShare({
                        files: [file],
                      })
                    ) {
                      await navigator.share({
                        title: `${month}月 第${route}次路程`,
                        text: `${month}月 第${route}次路程の週間班長レポートです。`,
                        files: [file],
                      });
                    } else {
                      // ファイル共有に対応していない環境ではPDFを保存
                      const downloadUrl =
                        URL.createObjectURL(blob);
                      const link =
                        document.createElement("a");
                      link.href = downloadUrl;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(downloadUrl);

                      alert(
                        "この端末ではPDFの直接共有に対応していないため、PDFを保存しました。保存したPDFをLINEなどから共有してください。"
                      );
                    }
                  } catch (error) {
                    console.error(
                      "PDF共有エラー",
                      error
                    );

                    if (
                      (error as Error)?.name !==
                      "AbortError"
                    ) {
                      alert(
                        "PDFの共有に失敗しました。もう一度お試しください。"
                      );
                    }
                  } finally {
                    const iframe =
                      document.querySelector(
                        'iframe[src^="/team-reports/pdf/"]'
                      );
                    iframe?.remove();

                    setSharingPdf(false);
                  }
                }}
                className={`rounded-2xl py-3 text-sm transition ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                {sharingPdf
                  ? "PDF作成中..."
                  : "📤 PDFを共有"}
              </button>
            </div>

            <button
              type="button"
              onClick={submitReport}
              disabled={submitting}
              className={`mt-3 w-full rounded-2xl py-3 text-sm transition ${
                darkMode
                  ? "bg-green-900/40 text-green-300 hover:bg-green-900/60"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              } disabled:opacity-50`}
            >
              {submitting
                ? "再提出中..."
                : "🔄 修正内容を再提出する"}
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <p className="text-sm text-gray-400">
              レポートの提出
            </p>

            <p
              className={`mt-3 text-sm leading-7 ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              ①〜③をすべて記入すると、
              スタッフへ提出できます。
            </p>

            <button
              type="button"
              onClick={submitReport}
              disabled={!allComplete || submitting}
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
                ? "提出中..."
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