"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

type MemberResult = {
  resultCount: string;
  resultAmount: string;
  targetCount: string;
  targetAmount: string;
  achieved: "" | "yes" | "no";
  victory: string;
  defeat: string;
};

export default function ResultsPage() {
  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [results, setResults] = useState<
    Record<string, MemberResult>
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

  // 班員構成と保存済みの結果を読み込む
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

        // 保存済みの結果を取得
        const resultsSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth,
            "routes",
            "route_1",
            "results",
            "members"
          )
        );

        const savedResults = resultsSnap.exists()
          ? resultsSnap.data()
          : {};

        const initialResults: Record<
          string,
          MemberResult
        > = {};

        allMembers.forEach((member: string) => {
          initialResults[member] = {
            resultCount:
              savedResults[member]?.resultCount || "",
            resultAmount:
              savedResults[member]?.resultAmount || "",
            targetCount:
              savedResults[member]?.targetCount || "",
            targetAmount:
              savedResults[member]?.targetAmount || "",
            achieved:
              savedResults[member]?.achieved || "",
            victory:
              savedResults[member]?.victory || "",
            defeat:
              savedResults[member]?.defeat || "",
          };
        });

        setResults(initialResults);
      } catch (error) {
        console.error(
          "班員結果の読み込みエラー",
          error
        );
      }
    };

    fetchData();
  }, [user, currentMonth]);

  // 入力内容を更新
  const updateResult = (
    member: string,
    field: keyof MemberResult,
    value: string
  ) => {
    setResults((prev) => ({
      ...prev,
      [member]: {
        ...prev[member],
        [field]: value,
      },
    }));
  };

  // 保存
  const saveResults = async () => {
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
          "results",
          "members"
        ),
        {
          ...results,
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/team-reports/routes/1"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 第1次路程へ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        ② 班員ごとの結果
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        班員一人ひとりの結果を振り返りましょう
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
            const memberResult = results[member] || {
              resultCount: "",
              resultAmount: "",
              targetCount: "",
              targetAmount: "",
              achieved: "",
              victory: "",
              defeat: "",
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
                  {/* 結果 / 目標 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      結果 / 目標
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        inputMode="numeric"
                        value={memberResult.resultCount}
                        onChange={(e) =>
                          updateResult(
                            member,
                            "resultCount",
                            e.target.value
                          )
                        }
                        className="w-20 rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                        placeholder="件数"
                      />

                      <span className="text-sm text-gray-400">
                        件
                      </span>

                      <input
                        inputMode="numeric"
                        value={memberResult.resultAmount}
                        onChange={(e) =>
                          updateResult(
                            member,
                            "resultAmount",
                            e.target.value
                          )
                        }
                        className="flex-1 rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                        placeholder="金額"
                      />

                      <span className="text-sm text-gray-400">
                        円
                      </span>

                      <span className="text-gray-400">
                        /
                      </span>

                      <input
                        inputMode="numeric"
                        value={memberResult.targetCount}
                        onChange={(e) =>
                          updateResult(
                            member,
                            "targetCount",
                            e.target.value
                          )
                        }
                        className="w-20 rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                        placeholder="件数"
                      />

                      <span className="text-sm text-gray-400">
                        件
                      </span>

                      <input
                        inputMode="numeric"
                        value={memberResult.targetAmount}
                        onChange={(e) =>
                          updateResult(
                            member,
                            "targetAmount",
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

                  {/* 達成 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      達成
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateResult(
                            member,
                            "achieved",
                            "yes"
                          )
                        }
                        className={`flex-1 rounded-2xl border py-4 ${
                          memberResult.achieved === "yes"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        ○ 達成
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateResult(
                            member,
                            "achieved",
                            "no"
                          )
                        }
                        className={`flex-1 rounded-2xl border py-4 ${
                          memberResult.achieved === "no"
                            ? "border-gray-500 bg-gray-100 text-gray-700"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        × 未達成
                      </button>
                    </div>
                  </div>

                  {/* 勝利点 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      勝利点
                    </p>

                    <textarea
                      value={memberResult.victory}
                      onChange={(e) =>
                        updateResult(
                          member,
                          "victory",
                          e.target.value
                        )
                      }
                      className="min-h-[140px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                      placeholder="この路程での勝利点"
                    />
                  </div>

                  {/* 敗北点 */}
                  <div>
                    <p className="mb-3 text-sm text-gray-400">
                      敗北点
                    </p>

                    <textarea
                      value={memberResult.defeat}
                      onChange={(e) =>
                        updateResult(
                          member,
                          "defeat",
                          e.target.value
                        )
                      }
                      className="min-h-[140px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
                      placeholder="この路程での敗北点"
                    />
                  </div>
                </div>
              </section>
            );
          })}

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