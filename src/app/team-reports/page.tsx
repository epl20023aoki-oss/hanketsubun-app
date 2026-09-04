"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function TeamReportsPage() {
  const [team, setTeam] = useState("");
  const [leader, setLeader] = useState("");
  const [subLeader, setSubLeader] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [year, month] = currentMonth.split("-");

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

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← ホームへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        週間班長レポート
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        班の歩みを記録していきましょう
      </p>

      {/* 月 */}
      <section className="mb-6">
        <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            対象月
          </p>

          <p className="mt-3 text-2xl font-light">
            {year}年{Number(month)}月
          </p>
        </div>
      </section>

      {/* 班 */}
      <section className="mb-6">
        <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
          <p className="mb-3 text-sm text-gray-400">
            班
          </p>

          <p className="text-xl">
            {team || "班名未設定"}
          </p>

          <Link
            href="/team-reports/members"
            className="mt-4 inline-block text-xs text-green-600"
          >
            班員構成を編集 →
          </Link>
        </div>
      </section>

      {/* 班員構成 */}
      <section className="mb-6">
        <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            班員構成
          </p>

          <div className="mt-5 space-y-3">
            <div>
              <p className="text-xs text-gray-400">
                班長
              </p>
              <p className="mt-1">
                {leader || "未設定"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                副班長
              </p>
              <p className="mt-1">
                {subLeader || "未設定"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                班員
              </p>

              {members.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {members
                    .filter((member) => member.trim() !== "")
                    .map((member, index) => (
                      <p key={index}>
                        {member}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="mt-1 text-gray-400">
                  未設定
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 路程 */}
      <section>
        <p className="mb-3 text-sm text-gray-400">
          今月の路程
        </p>

       <div className="space-y-4">
  <Link href="/team-reports/routes/1">
    <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
      <p className="text-sm text-gray-400">
        {year}年{Number(month)}月
      </p>

      <p className="mt-2 text-lg">
        1次路程
      </p>

      <p className="mt-3 text-xs text-green-600">
        レポートを開く →
      </p>
    </div>
  </Link>

  {[2, 3, 4, 5].map((route) => (
    <div
      key={route}
      className="rounded-3xl bg-gray-50 p-6 shadow-sm"
    >
      <p className="text-sm text-gray-400">
        {year}年{Number(month)}月
      </p>

      <p className="mt-2 text-lg">
        {route}次路程
      </p>

      <p className="mt-3 text-xs text-green-600">
        レポートを開く →
      </p>
    </div>
  ))}
</div>
      </section>
    </main>
  );
}