"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

type TeamReport = {
  id: string;
  month: string;
  route: number;
  team: string;
  leader: string;
  subLeader: string;
  members: string[];
  startDate: string;
  endDate: string;

  reflection?: {
    slogan?: string;
    victory?: string;
    defeat?: string;
    currentState?: string;
    changes?: string;
    nextSlogan?: string;
  };

  results?: Record<
    string,
    {
      resultCount?: string;
      resultAmount?: string;
      targetCount?: string;
      targetAmount?: string;
      achieved?: string;
      victory?: string;
      defeat?: string;
    }
  >;

  goals?: Record<
    string,
    {
      externalCount?: string;
      externalAmount?: string;
      internalGoal?: string;
      actions?: string;
    }
  >;

  submittedAt?: any;
};

export default function TeamReportPDFPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [report, setReport] = useState<TeamReport | null>(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }

    return false;
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const snapshot = await getDoc(
          doc(db, "submitted_team_reports", id)
        );

        if (snapshot.exists()) {
          setReport({
            id: snapshot.id,
            ...(snapshot.data() as Omit<TeamReport, "id">),
          });
        }
      } catch (error) {
        console.error("週間班長レポート取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return "";

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${Number(parts[1])}月${Number(parts[2])}日`;
  };

  const formatSubmittedAt = (timestamp: any) => {
    if (!timestamp?.toDate) return "";

    const date = timestamp.toDate();

    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMemberNames = () => {
    if (!report) return [];

    const names = new Set<string>();

    report.members?.forEach((name) => {
      if (name) {
        names.add(name);
      }
    });

    if (report.results) {
      Object.keys(report.results).forEach((name) => {
        if (name !== "updatedAt") {
          names.add(name);
        }
      });
    }

    if (report.goals) {
      Object.keys(report.goals).forEach((name) => {
        if (name !== "updatedAt") {
          names.add(name);
        }
      });
    }

    return Array.from(names);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        読み込み中...
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg">
            レポートが見つかりませんでした。
          </p>

          <button
            onClick={() => router.back()}
            className="mt-6 rounded-xl bg-gray-100 px-5 py-3 text-sm"
          >
            ← 戻る
          </button>
        </div>
      </main>
    );
  }

  const memberNames = getMemberNames();

  return (
    <main
      className={`min-h-screen p-8 md:p-12 print:bg-white print:text-black ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-black"
      }`}
    >
      <div className="mx-auto max-w-4xl">

        {/* 操作部分 */}
        <div className="mb-8 flex items-center justify-between print:hidden">

          <button
            onClick={() => router.back()}
            className={`text-sm ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            ← 戻る
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() => window.print()}
              className={`rounded-xl px-4 py-2 text-sm ${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              🖨 印刷
            </button>

            <button
              onClick={() => {
                const newMode = !darkMode;

                setDarkMode(newMode);

                localStorage.setItem(
                  "darkMode",
                  JSON.stringify(newMode)
                );
              }}
              className="text-lg"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

          </div>
        </div>

        {/* タイトル */}
        <h1 className="mb-3 text-center text-3xl font-bold">
          {report.month} 週間班長レポート
        </h1>

        <p className="mb-10 text-center text-xl font-bold">
          第{report.route}次
        </p>

        {/* 基本情報 */}
        <section className="mb-10">

          <div className="space-y-2">
            <p>
              <span className="font-bold">班：</span>
              {report.team || "未設定"}
            </p>

            <p>
              <span className="font-bold">期間：</span>
              {formatDate(report.startDate)} 〜{" "}
              {formatDate(report.endDate)}
            </p>

            <p>
              <span className="font-bold">班長：</span>
              {report.leader || "未設定"}
            </p>

            <p>
              <span className="font-bold">副班長：</span>
              {report.subLeader || "未設定"}
            </p>

            <p>
              <span className="font-bold">班員：</span>
              {report.members?.length
                ? report.members.join("、")
                : "なし"}
            </p>
          </div>

          {report.submittedAt && (
            <p className="mt-4 text-sm text-gray-500">
              提出日時：{formatSubmittedAt(report.submittedAt)}
            </p>
          )}

        </section>

        <hr className="my-10" />

        {/* ① */}
        <section className="mb-12">

          <h2 className="mb-8 text-2xl font-bold">
            ① 前路程の振り返り
          </h2>

          <ReportSection
            title="班としての今路程の取り組みに対しての結果"
            value={report.reflection?.slogan}
          />

          <ReportSection
            title="勝利点"
            value={report.reflection?.victory}
          />

          <ReportSection
            title="敗北点"
            value={report.reflection?.defeat}
          />

          <ReportSection
            title="現状"
            value={report.reflection?.currentState}
          />

          <ReportSection
            title="変更・追加"
            value={report.reflection?.changes}
          />

          <ReportSection
            title="次路程に向けてのスローガン"
            value={report.reflection?.nextSlogan}
          />

        </section>

        <hr className="my-10" />

        {/* ② */}
        <section className="mb-12">

          <h2 className="mb-8 text-2xl font-bold">
            ② 班員の結果
          </h2>

          {memberNames.length > 0 ? (
            <div className="space-y-10">

              {memberNames.map((name) => {

                const data = report.results?.[name];

                if (!data) {
                  return null;
                }

                return (
                  <div
                    key={name}
                    className="break-inside-avoid"
                  >
                    <h3 className="mb-5 text-xl font-bold">
                      {name}
                    </h3>

                    <div className="space-y-5">

                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          結果目標
                        </p>
                        <p className="mt-1">
                          {data.targetCount || "0"}件{" "}
                          {data.targetAmount || "0"}円
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          結果
                        </p>
                        <p className="mt-1">
                          {data.resultCount || "0"}件{" "}
                          {data.resultAmount || "0"}円
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          達成
                        </p>
                        <p className="mt-1">
                          {data.achieved || "未入力"}
                        </p>
                      </div>

                      <ReportSection
                        title="勝利点"
                        value={data.victory}
                      />

                      <ReportSection
                        title="敗北点"
                        value={data.defeat}
                      />

                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <p className="text-gray-500">
              班員の結果はありません。
            </p>
          )}

        </section>

        <hr className="my-10" />

        {/* ③ */}
        <section className="mb-12">

          <h2 className="mb-8 text-2xl font-bold">
            ③ 次路程の個人目標
          </h2>

          {memberNames.length > 0 ? (
            <div className="space-y-10">

              {memberNames.map((name) => {

                const data = report.goals?.[name];

                if (!data) {
                  return null;
                }

                return (
                  <div
                    key={name}
                    className="break-inside-avoid"
                  >
                    <h3 className="mb-5 text-xl font-bold">
                      {name}
                    </h3>

                    <div className="space-y-5">

                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          外的目標
                        </p>

                        <p className="mt-1">
                          {data.externalCount || "0"}件{" "}
                          {data.externalAmount || "0"}円
                        </p>
                      </div>

                      <ReportSection
                        title="内的目標"
                        value={data.internalGoal}
                      />

                      <ReportSection
                        title="具体的取り組み"
                        value={data.actions}
                      />

                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <p className="text-gray-500">
              個人目標はありません。
            </p>
          )}

        </section>

      </div>
    </main>
  );
}

function ReportSection({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <div className="mb-7 break-inside-avoid">
      <p className="text-sm font-bold text-gray-500">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap leading-7">
        {value || "未入力"}
      </p>
    </div>
  );
}