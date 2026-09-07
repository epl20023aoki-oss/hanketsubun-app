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

type MemberGoal = {
  name: string;
  externalCount: string;
  externalAmount: string;
  internalGoal: string;
  actions: string;
};

export default function GoalsPage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<MemberGoal[]>([]);
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

  // 班員構成と保存済み目標を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      try {
        // 班員構成を読み込む
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

        // 保存済み目標を読み込む
        const goalsSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth,
            "routes",
            `route_${route}`,
            "goals",
            "members"
          )
        );

        const savedGoals = goalsSnap.exists()
          ? goalsSnap.data()
          : {};

        const loadedMembers: MemberGoal[] =
          teamMembers.map((name) => {
            const saved = savedGoals[name] || {};

            return {
              name,
              externalCount:
                saved.externalCount || "",
              externalAmount:
                saved.externalAmount || "",
              internalGoal:
                saved.internalGoal || "",
              actions:
                saved.actions || "",
            };
          });

        setMembers(loadedMembers);
      } catch (error) {
        console.error(
          "個人目標の読み込みエラー",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, currentMonth, route]);

  // 入力内容を更新
  const updateMember = (
    index: number,
    field: keyof MemberGoal,
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
  const saveGoals = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    try {
      setSaving(true);

      const goalData: Record<
        string,
        Omit<MemberGoal, "name">
      > = {};

      members.forEach((member) => {
        goalData[member.name] = {
          externalCount: member.externalCount,
          externalAmount: member.externalAmount,
          internalGoal: member.internalGoal,
          actions: member.actions,
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
          "goals",
          "members"
        ),
        {
          ...goalData,
          updatedAt: new Date(),
        }
      );

      alert("次路程の個人目標を保存しました");
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
        ③ 次路程の個人目標
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

              {/* 外的目標 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  外的目標
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={member.externalCount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "externalCount",
                          e.target.value
                        )
                      }
                      placeholder="件数"
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
                      value={member.externalAmount}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "externalAmount",
                          e.target.value
                        )
                      }
                      placeholder="金額"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4 pr-12 outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      円
                    </span>
                  </div>
                </div>
              </div>

              {/* 内的目標 */}
              <div className="mb-6">
                <p className="mb-3 text-sm text-gray-400">
                  内的目標
                </p>

                <textarea
                  value={member.internalGoal}
                  onChange={(e) =>
                    updateMember(
                      index,
                      "internalGoal",
                      e.target.value
                    )
                  }
                  placeholder="次路程で意識する内的目標を入力してください"
                  className="min-h-32 w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                />
              </div>

              {/* 具体的な取り組み */}
              <div>
                <p className="mb-3 text-sm text-gray-400">
                  具体的な取り組み
                </p>

                <textarea
                  value={member.actions}
                  onChange={(e) =>
                    updateMember(
                      index,
                      "actions",
                      e.target.value
                    )
                  }
                  placeholder="目標達成のための具体的な取り組みを入力してください"
                  className="min-h-40 w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                />
              </div>
            </section>
          ))}

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