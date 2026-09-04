"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

type MemberGoal = {
  externalCount: string;
  externalAmount: string;
  internalGoal: string;
  actions: string;
};

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [goals, setGoals] = useState<
    Record<string, MemberGoal>
  >({});
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

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

  // 班員構成と保存済みの目標を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 班員構成を取得
        const teamSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth
          )
        );

        if (!teamSnap.exists()) return;

        const teamData = teamSnap.data();

        const allMembers = [
          teamData.leader || "",
          teamData.subLeader || "",
          ...(teamData.members || []),
        ].filter(
          (member: string) => member.trim() !== ""
        );

        setMembers(allMembers);

        // 保存済みの目標を取得
        const goalsSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth,
            "routes",
            "route_1",
            "goals",
            "members"
          )
        );

        const savedGoals = goalsSnap.exists()
          ? goalsSnap.data()
          : {};

        const initialGoals: Record<
          string,
          MemberGoal
        > = {};

        allMembers.forEach((member: string) => {
          initialGoals[member] = {
            externalCount:
              savedGoals[member]?.externalCount || "",
            externalAmount:
              savedGoals[member]?.externalAmount || "",
            internalGoal:
              savedGoals[member]?.internalGoal || "",
            actions:
              savedGoals[member]?.actions || "",
          };
        });

        setGoals(initialGoals);
      } catch (error) {
        console.error(
          "個人目標の読み込みエラー",
          error
        );
      }
    };

    fetchData();
  }, [user, currentMonth]);

  // 入力内容を更新
  const updateGoal = (
    member: string,
    field: keyof MemberGoal,
    value: string
  ) => {
    setGoals((prev) => ({
      ...prev,
      [member]: {
        ...prev[member],
        [field]: value,
      },
    }));
  };

  // 保存
  const saveGoals = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "team_reports",
          currentMonth,
          "routes",
          "route_1",
          "goals",
          "members"
        ),
        {
          ...goals,
          updatedAt: new Date(),
        }
      );

      alert("個人目標を保存しました");
    } catch (error) {
      console.error(
        "個人目標の保存エラー",
        error
      );

      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/team-reports/routes/1"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 第1次路程へ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        ③ 次路程の個人目標
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        次の路程に向けた一人ひとりの目標を記録しましょう
      </p>

      {members.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">
            班員が登録されていません
          </p>

          <Link
            href="/team-reports/members"
            className="mt-4 inline-block text-sm text-green-600"
          >
            班員構成を登録する →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {members.map((member, index) => {
            const memberGoal = goals[member] || {
              externalCount: "",
              externalAmount: "",
              internalGoal: "",
              actions: "",
            };

            return (
              <section
                key={`${member}-${index}`}
                className="rounded-3xl bg-gray-50 p-6 shadow-sm"
              >
                <p className="mb-6 text-lg">
                  {member}
                </p>

                <div className="space-y-6">
                  {/* 外的目標 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      外的目標
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        inputMode="numeric"
                        value={memberGoal.externalCount}
                        onChange={(e) =>
                          updateGoal(
                            member,
                            "externalCount",
                            e.target.value
                          )
                        }
                        className="w-24 rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                        placeholder="件数"
                      />

                      <span className="text-sm text-gray-400">
                        件
                      </span>

                      <input
                        inputMode="numeric"
                        value={memberGoal.externalAmount}
                        onChange={(e) =>
                          updateGoal(
                            member,
                            "externalAmount",
                            e.target.value
                          )
                        }
                        className="flex-1 rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                        placeholder="金額"
                      />

                      <span className="text-sm text-gray-400">
                        円
                      </span>
                    </div>
                  </div>

                  {/* 内的目標 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      内的目標
                    </p>

                    <textarea
                      value={memberGoal.internalGoal}
                      onChange={(e) =>
                        updateGoal(
                          member,
                          "internalGoal",
                          e.target.value
                        )
                      }
                      className="min-h-[140px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                      placeholder="次の路程で目指したい内的な目標"
                    />
                  </div>

                  {/* 具体的な取り組み */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      具体的な取り組み
                    </p>

                    <textarea
                      value={memberGoal.actions}
                      onChange={(e) =>
                        updateGoal(
                          member,
                          "actions",
                          e.target.value
                        )
                      }
                      className="min-h-[160px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                      placeholder="目標を達成するために具体的に取り組むこと"
                    />
                  </div>
                </div>
              </section>
            );
          })}

          <button
            type="button"
            onClick={saveGoals}
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