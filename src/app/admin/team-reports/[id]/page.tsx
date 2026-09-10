"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

type TeamReport = {
  id: string;
  uid?: string;
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

export default function TeamReportDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const decodedId = decodeURIComponent(id || "");
  const [selectedMonth, uid, route] = decodedId.split("|");

  const [report, setReport] = useState<TeamReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const snapshot = await getDoc(
          doc(
            db,
            "submitted_team_reports",
            selectedMonth,
            "users",
            uid,
            "routes",
            route
          )
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

    if (selectedMonth && uid && route) {
      fetchReport();
    }
  }, [selectedMonth, uid, route]);

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

    if (report.members) {
      report.members.forEach((name) => {
        if (name) names.add(name);
      });
    }

    if (report.results) {
      Object.keys(report.results).forEach((name) => {
        if (name !== "updatedAt") names.add(name);
      });
    }

    if (report.goals) {
      Object.keys(report.goals).forEach((name) => {
        if (name !== "updatedAt") names.add(name);
      });
    }

    return Array.from(names);
  };

  if (loading) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        読み込み中...
      </main>
    );
  }

  if (!report) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center px-6 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="text-center">
          <p className="text-lg">レポートが見つかりませんでした。</p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-6 rounded-2xl bg-green-600 px-6 py-3 text-white"
          >
            管理画面に戻る
          </button>
        </div>
      </main>
    );
  }

  const memberNames = getMemberNames();

  return (
    <main
      className={`min-h-screen px-4 py-8 transition-colors ${
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="mx-auto max-w-4xl">
       {/* ヘッダー操作 */}
<div className="mb-6 flex items-center justify-between">
  <button
    onClick={() => router.push("/admin")}
    className={`text-sm ${
      darkMode
        ? "text-green-300 hover:text-green-200"
        : "text-green-600 hover:text-green-700"
    }`}
  >
    ← 管理画面に戻る
  </button>

  <button
    onClick={() => router.push(`/team-reports/pdf/${encodeURIComponent(`${report.month}|${report.uid || uid}|${report.route}`)}`)}
    className={`rounded-xl px-4 py-2 text-sm ${
      darkMode
        ? "bg-gray-700 text-white"
        : "bg-gray-100 text-gray-900"
    }`}
  >
    🖨 PDF
  </button>
</div>

        {/* ヘッダー */}
        <div
          className={`rounded-3xl p-6 shadow-sm ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}
              >
                週間班長レポート
              </p>

              <h1 className="mt-2 text-2xl font-bold">
                {report.month}・{report.route}次
              </h1>

              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {report.team || "班未設定"}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              提出済み
            </span>
          </div>

          <div
            className={`mt-6 rounded-2xl p-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <p className="text-sm font-medium">期間</p>

            <p
              className={`mt-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {formatDate(report.startDate)} 〜{" "}
              {formatDate(report.endDate)}
            </p>
          </div>

          {report.submittedAt && (
            <p
              className={`mt-4 text-xs ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              提出日時：{formatSubmittedAt(report.submittedAt)}
            </p>
          )}
        </div>

        {/* 班員構成 */}
        <section className="mt-6">
          <h2 className="mb-3 px-1 text-lg font-bold">班員構成</h2>

          <div
            className={`rounded-3xl p-6 shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">班長</p>
                <p className="mt-1 font-medium">
                  {report.leader || "未設定"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">副班長</p>
                <p className="mt-1 font-medium">
                  {report.subLeader || "未設定"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">班員</p>

                {report.members?.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.members.map((name, index) => (
                      <span
                        key={`${name}-${index}`}
                        className={`rounded-full px-3 py-1 text-sm ${
                          darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">班員なし</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ① 班としての振り返り */}
        <section className="mt-8">
          <div className="mb-3 px-1">
            <p className="text-sm text-green-600">①</p>
            <h2 className="text-lg font-bold">
              前路程の振り返り
            </h2>
          </div>

          <div
            className={`rounded-3xl p-6 shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="space-y-6">
              <ReportText
                label="班としての今路程の取り組みに対しての結果"
                value={report.reflection?.slogan}
                darkMode={darkMode}
              />

              <ReportText
                label="勝利点"
                value={report.reflection?.victory}
                darkMode={darkMode}
              />

              <ReportText
                label="敗北点"
                value={report.reflection?.defeat}
                darkMode={darkMode}
              />

              <ReportText
                label="現状"
                value={report.reflection?.currentState}
                darkMode={darkMode}
              />

              <ReportText
                label="変更・追加"
                value={report.reflection?.changes}
                darkMode={darkMode}
              />

              <ReportText
                label="次路程に向けてのスローガン"
                value={report.reflection?.nextSlogan}
                darkMode={darkMode}
              />
            </div>
          </div>
        </section>

        {/* ② 班員の結果 */}
        <section className="mt-8">
          <div className="mb-3 px-1">
            <p className="text-sm text-green-600">②</p>
            <h2 className="text-lg font-bold">
              班員の結果
            </h2>
          </div>

          <div className="space-y-4">
            {memberNames.length > 0 ? (
              memberNames.map((name) => {
                const data = report.results?.[name];

                if (!data) return null;

                return (
                  <div
                    key={name}
                    className={`rounded-3xl p-6 shadow-sm ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3 className="text-lg font-bold">{name}</h3>

                    <div className="mt-5 space-y-5">
                      <div>
                        <p className="text-sm text-gray-400">
                          結果目標
                        </p>
                        <p className="mt-1">
                          {data.targetCount || "0"}件{" "}
                          {data.targetAmount || "0"}円
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          結果
                        </p>
                        <p className="mt-1">
                          {data.resultCount || "0"}件{" "}
                          {data.resultAmount || "0"}円
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          達成
                        </p>
                        <p className="mt-1 font-medium">
                          {data.achieved || "未入力"}
                        </p>
                      </div>

                      <ReportText
                        label="勝利点"
                        value={data.victory}
                        darkMode={darkMode}
                      />

                      <ReportText
                        label="敗北点"
                        value={data.defeat}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyCard
                text="班員の結果はありません。"
                darkMode={darkMode}
              />
            )}
          </div>
        </section>

        {/* ③ 次路程の個人目標 */}
        <section className="mt-8 pb-10">
          <div className="mb-3 px-1">
            <p className="text-sm text-green-600">③</p>
            <h2 className="text-lg font-bold">
              次路程の個人目標
            </h2>
          </div>

          <div className="space-y-4">
            {memberNames.length > 0 ? (
              memberNames.map((name) => {
                const data = report.goals?.[name];

                if (!data) return null;

                return (
                  <div
                    key={name}
                    className={`rounded-3xl p-6 shadow-sm ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3 className="text-lg font-bold">{name}</h3>

                    <div className="mt-5 space-y-5">
                      <div>
                        <p className="text-sm text-gray-400">
                          外的目標
                        </p>

                        <p className="mt-1">
                          {data.externalCount || "0"}件{" "}
                          {data.externalAmount || "0"}円
                        </p>
                      </div>

                      <ReportText
                        label="内的目標"
                        value={data.internalGoal}
                        darkMode={darkMode}
                      />

                      <ReportText
                        label="具体的取り組み"
                        value={data.actions}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyCard
                text="個人目標はありません。"
                darkMode={darkMode}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ReportText({
  label,
  value,
  darkMode,
}: {
  label: string;
  value?: string;
  darkMode: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>

      <p
        className={`mt-2 whitespace-pre-wrap leading-7 ${
          value
            ? darkMode
              ? "text-gray-200"
              : "text-gray-700"
            : "text-gray-400"
        }`}
      >
        {value || "未入力"}
      </p>
    </div>
  );
}

function EmptyCard({
  text,
  darkMode,
}: {
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-6 text-sm shadow-sm ${
        darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-400"
      }`}
    >
      {text}
    </div>
  );
}