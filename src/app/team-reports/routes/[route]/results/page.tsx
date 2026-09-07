"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

type Props = {
  params: Promise<{
    route: string;
  }>;
};

type MemberResult = {
  name: string;
  resultCount: string;
  resultAmount: string;
  targetCount: string;
  targetAmount: string;
  achieved: "" | "yes" | "no";
  victory: string;
  defeat: string;
};

export default function ResultsPage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<MemberResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [, month] = currentMonth.split("-");

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

  // 班員構成と保存済み結果を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      try {
        const teamSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth
          )
        );

        if (!teamSnap.exists()) {
          setMembers([]);
          return;
        }

        const teamData = teamSnap.data();

        const teamMembers: string[] = [
          teamData.leader || "",
          teamData.subLeader || "",
          ...(teamData.members || []),
        ].filter(
          (member) => member.trim() !== ""
        );

        const resultsSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth,
            "routes",
            `route_${route}`,
            "results",
            "members"
          )
        );

        const savedResults = resultsSnap.exists()
          ? resultsSnap.data()
          : {};

        const loadedMembers: MemberResult[] =
          teamMembers.map((name) => {
            const saved = savedResults[name] || {};

            return {
              name,
              resultCount: saved.resultCount || "",
              resultAmount: saved.resultAmount || "",
              targetCount: saved.targetCount || "",
              targetAmount: saved.targetAmount || "",
              achieved: saved.achieved || "",
              victory: saved.victory || "",
              defeat: saved.defeat || "",
            };
          });

        setMembers(loadedMembers);
      } catch (error) {
        console.error(
          "班員結果の読み込みエラー",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, currentMonth, route]);

  const updateMember = (
    index: number,
    field: keyof MemberResult,
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((member, i) =>
        i === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  // 保存
  const saveResults = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    try {
      setSaving(true);

      const resultData: Record<
        string,
        Omit<MemberResult, "name">
      > = {};

      members.forEach((member) => {
        resultData[member.name] = {
          resultCount: member.resultCount,
          resultAmount: member.resultAmount,
          targetCount: member.targetCount,
          targetAmount: member.targetAmount,
          achieved: member.achieved,
          victory: member.victory,
          defeat: member.defeat,
        };
      });

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "team_reports",
          currentMonth,
          "routes",
          `route_${route}`,
          "results",
          "members"
        ),
        {
          ...resultData,
          updatedAt: new Date(),
        }
      );

      alert("班員ごとの結果を保存しました");
    } catch (error) {
      console.error(
        "班員結果の保存エラー",
        error
      );

      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-gray-400">
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/team-reports/routes/${route}`}
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 第{route}次路程へ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        {Number(month)}月 第{route}次路程
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        ② 班員ごとの結果
      </p>

      {members.length === 0 ? (
        <section className="rounded-3xl bg-gray-50 p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            班員構成がまだ登録されていません。
          </p>

          <Link
            href="/team-reports/members"
            className="mt-4 inline-block text-xs text-green-600"
          >
            班員構成を登録する →
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {members.map((member, index) => (
            <section
              key={`${member.name}-${index}`}
              className="rounded-3xl bg-gray-50 p-6 shadow-sm"
            >
              <p className="mb-6 text-xl">
                {member.name}
              </p>

              {/* 結果目標 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  目標
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={member.targetCount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "targetCount",
                          e.target.value
                        )
                      }
                      placeholder="目標件数"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4 pr-12 outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      件
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={member.targetAmount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "targetAmount",
                          e.target.value
                        )
                      }
                      placeholder="目標金額"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4 pr-12 outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      円
                    </span>
                  </div>
                </div>
              </div>

              {/* 結果 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  結果
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={member.resultCount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "resultCount",
                          e.target.value
                        )
                      }
                      placeholder="結果件数"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4 pr-12 outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      件
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={member.resultAmount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "resultAmount",
                          e.target.value
                        )
                      }
                      placeholder="結果金額"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4 pr-12 outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      円
                    </span>
                  </div>
                </div>
              </div>

              {/* 達成 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  達成
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateMember(
                        index,
                        "achieved",
                        "yes"
                      )
                    }
                    className={`rounded-2xl border py-4 transition ${
                      member.achieved === "yes"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    ○ 達成
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateMember(
                        index,
                        "achieved",
                        "no"
                      )
                    }
                    className={`rounded-2xl border py-4 transition ${
                      member.achieved === "no"
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    × 未達成
                  </button>
                </div>
              </div>

              {/* 勝利点 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  勝利点
                </p>

                <textarea
                  value={member.victory}
                  onChange={(e) =>
                    updateMember(
                      index,
                      "victory",
                      e.target.value
                    )
                  }
                  placeholder="この路程での勝利点を入力してください"
                  className="min-h-32 w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                />
              </div>

              {/* 敗北点 */}
              <div>
                <p className="mb-3 text-sm text-gray-400">
                  敗北点
                </p>

                <textarea
                  value={member.defeat}
                  onChange={(e) =>
                    updateMember(
                      index,
                      "defeat",
                      e.target.value
                    )
                  }
                  placeholder="この路程での敗北点を入力してください"
                  className="min-h-32 w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                />
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={saveResults}
            disabled={saving}
            className="w-full rounded-2xl bg-gray-800 py-4 text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      )}
    </main>
  );
}