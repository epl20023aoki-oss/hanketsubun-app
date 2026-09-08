"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type RouteStatus = {
  route: number;
  startDate: string;
  endDate: string;
  reflection: boolean;
  results: boolean;
  goals: boolean;
};

export default function TeamReportsPage() {
  const [team, setTeam] = useState("");
  const [leader, setLeader] = useState("");
  const [subLeader, setSubLeader] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const [routeStatuses, setRouteStatuses] = useState<RouteStatus[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [year, month] = currentMonth.split("-");

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

  // 班員構成を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchTeamMembers = async () => {
      const docSnap = await getDoc(
        doc(
          db,
          "users",
          user.uid,
          "team_reports",
          currentMonth
        )
      );

      if (docSnap.exists()) {
        const data = docSnap.data();

        setTeam(data.team || "");
        setLeader(data.leader || "");
        setSubLeader(data.subLeader || "");
        setMembers(data.members || []);
      }
    };

    fetchTeamMembers();
  }, [user, currentMonth]);

  // 1〜5次路程の入力状況を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchRouteStatuses = async () => {
      try {
        const statuses: RouteStatus[] = [];

        for (let route = 1; route <= 5; route++) {
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

          let startDate = "";
          let endDate = "";
          let reflection = false;

          if (routeSnap.exists()) {
            const routeData = routeSnap.data();

            startDate = routeData.startDate || "";
            endDate = routeData.endDate || "";

            reflection =
              !!routeData.slogan ||
              !!routeData.victory ||
              !!routeData.defeat ||
              !!routeData.currentState ||
              !!routeData.changes ||
              !!routeData.nextSlogan;
          }

          // ② 班員ごとの結果
          const resultsSnap = await getDoc(
            doc(
              routeRef,
              "results",
              "members"
            )
          );

          const resultsData = resultsSnap.exists()
            ? resultsSnap.data()
            : {};

          const resultsUpdatedAt =
            resultsData.updatedAt;

          const results = !!resultsUpdatedAt;

          // ③ 次路程の個人目標
          const goalsSnap = await getDoc(
            doc(
              routeRef,
              "goals",
              "members"
            )
          );

          const goalsData = goalsSnap.exists()
            ? goalsSnap.data()
            : {};

          const goalsUpdatedAt =
            goalsData.updatedAt;

          const goals = !!goalsUpdatedAt;

          statuses.push({
            route,
            startDate,
            endDate,
            reflection,
            results,
            goals,
          });
        }

        setRouteStatuses(statuses);
      } catch (error) {
        console.error(
          "路程状況の読み込みエラー",
          error
        );
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRouteStatuses();
  }, [user, currentMonth]);

  const formatDate = (date: string) => {
    if (!date) return "";

    const [, m, d] = date.split("-");

    return `${Number(m)}月${Number(d)}日`;
  };

  // ダークモード設定の読み込みが終わるまで表示しない
  if (!mounted) return null;

  return (
    <main
      className={`mx-auto min-h-screen max-w-2xl px-6 py-10 transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-white text-gray-800"
      }`}
    >
      <Link
        href="/"
        className={`mb-6 inline-block text-sm ${
          darkMode ? "text-gray-400" : "text-gray-400"
        }`}
      >
        ← ホームへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        週間班長レポート
      </h1>

      <p
        className={`mb-10 text-sm ${
          darkMode ? "text-gray-400" : "text-gray-400"
        }`}
      >
        班の歩みを記録していきましょう
      </p>

      {/* 月 */}
      <section className="mb-6">
        <div
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
          >
            対象月
          </p>

          <p className="mt-3 text-2xl font-light">
            {year}年{Number(month)}月
          </p>
        </div>
      </section>

      {/* 班 */}
      <section className="mb-6">
        <div
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p
            className={`mb-3 text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
          >
            班
          </p>

          <p className="text-xl">
            {team || "班名未設定"}
          </p>

          <Link
            href="/team-reports/members"
            className={`mt-4 inline-block text-xs ${
              darkMode
                ? "text-green-400"
                : "text-green-600"
            }`}
          >
            班員構成を編集 →
          </Link>
        </div>
      </section>

      {/* 班員構成 */}
      <section className="mb-6">
        <div
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
          >
            班員構成
          </p>

          <div className="mt-5 space-y-3">
            <div>
              <p
                className={`text-xs ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
              >
                班長
              </p>

              <p className="mt-1">
                {leader || "未設定"}
              </p>
            </div>

            <div>
              <p
                className={`text-xs ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
              >
                副班長
              </p>

              <p className="mt-1">
                {subLeader || "未設定"}
              </p>
            </div>

            <div>
              <p
                className={`text-xs ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
              >
                班員
              </p>

              {members.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {members
                    .filter(
                      (member) =>
                        member.trim() !== ""
                    )
                    .map((member, index) => (
                      <p key={index}>
                        {member}
                      </p>
                    ))}
                </div>
              ) : (
                <p
                  className={`mt-1 ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-400"
                  }`}
                >
                  未設定
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 路程 */}
      <section>
        <p
          className={`mb-3 text-sm ${
            darkMode
              ? "text-gray-400"
              : "text-gray-400"
          }`}
        >
          今月の路程
        </p>

        {loadingRoutes ? (
          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
          >
            路程状況を読み込み中...
          </p>
        ) : (
          <div className="space-y-4">
            {routeStatuses.map((routeStatus) => (
              <Link
                key={routeStatus.route}
                href={`/team-reports/routes/${routeStatus.route}`}
                className="block"
              >
                <div
                  className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-800/80"
                      : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {year}年{Number(month)}月
                  </p>

                  <p className="mt-2 text-lg">
                    {routeStatus.route}次路程
                  </p>

                  <p
                    className={`mt-2 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {routeStatus.startDate &&
                    routeStatus.endDate
                      ? `${formatDate(
                          routeStatus.startDate
                        )}〜${formatDate(
                          routeStatus.endDate
                        )}`
                      : "期間：未設定"}
                  </p>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          darkMode
                            ? "text-gray-300"
                            : "text-gray-500"
                        }
                      >
                        ① 前路程の振り返り
                      </span>

                      <span
                        className={
                          routeStatus.reflection
                            ? darkMode
                              ? "text-green-400"
                              : "text-green-600"
                            : darkMode
                              ? "text-gray-400"
                              : "text-gray-400"
                        }
                      >
                        {routeStatus.reflection
                          ? "✓ 記入済み"
                          : "未記入"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={
                          darkMode
                            ? "text-gray-300"
                            : "text-gray-500"
                        }
                      >
                        ② 班員ごとの結果
                      </span>

                      <span
                        className={
                          routeStatus.results
                            ? darkMode
                              ? "text-green-400"
                              : "text-green-600"
                            : darkMode
                              ? "text-gray-400"
                              : "text-gray-400"
                        }
                      >
                        {routeStatus.results
                          ? "✓ 記入済み"
                          : "未記入"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={
                          darkMode
                            ? "text-gray-300"
                            : "text-gray-500"
                        }
                      >
                        ③ 次路程の個人目標
                      </span>

                      <span
                        className={
                          routeStatus.goals
                            ? darkMode
                              ? "text-green-400"
                              : "text-green-600"
                            : darkMode
                              ? "text-gray-400"
                              : "text-gray-400"
                        }
                      >
                        {routeStatus.goals
                          ? "✓ 記入済み"
                          : "未記入"}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`mt-5 text-xs ${
                      darkMode
                        ? "text-green-400"
                        : "text-green-600"
                    }`}
                  >
                    レポートを開く →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}