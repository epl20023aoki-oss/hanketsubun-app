"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

type Props = {
  params: Promise<{
    route: string;
  }>;
  searchParams: Promise<{
    month?: string;
  }>;
};

type MemberGoal = {
  name: string;
  externalCount: string;
  externalAmount: string;
  internalGoal: string;
  actions: string;
};

export default function GoalsPage({
  params,
  searchParams,
}: Props) {
  const { route } = use(params);
  const { month: monthParam } = use(searchParams);

  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<MemberGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // URLで指定された月を使用する
  const selectedMonth = monthParam || currentMonth;
  const [, month] = selectedMonth.split("-");

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
            selectedMonth
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
            selectedMonth,
            "routes",
            `route_${route}`,
            "goals",
            "members"
          )
        );

        const savedGoals = goalsSnap.exists()
          ? goalsSnap.data()
          : {};

        // 共有入力URLから保存された班員データを読み込み、
        // 班長側の通常データより優先して表示する
        let sharedInputs: Record<string, any> = {};

        try {
          // 新方式：路程に紐付けたshareIdから直接取得する
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
          const shareId = routeSnap.exists()
            ? routeSnap.data().shareId || ""
            : "";

          if (shareId) {
            const shareSnap = await getDoc(
              doc(db, "team_report_inputs", shareId)
            );

            if (shareSnap.exists()) {
              const data = shareSnap.data();
              sharedInputs = data.inputs || {};
            }
          } else {
            // 旧方式の共有URLにも対応するための移行用読み込み
            // createdByで自分のデータだけに限定して検索する
            const legacySnap = await getDocs(
              query(
                collection(db, "team_report_inputs"),
                where("createdBy", "==", user.uid),
                where("month", "==", selectedMonth),
                where("route", "==", Number(route))
              )
            );

            legacySnap.forEach((sharedDoc) => {
              const data = sharedDoc.data();
              Object.assign(
                sharedInputs,
                data.inputs || {}
              );
            });
          }
        } catch (sharedError) {
          console.error(
            "共有入力データの読み込みエラー",
            sharedError
          );
        }

        const loadedMembers: MemberGoal[] =
          teamMembers.map((name) => {
            const saved = savedGoals[name] || {};
            const shared = sharedInputs[name]?.goals || {};

            const merged = {
              ...saved,
              ...shared,
            };

            return {
              name,
              externalCount:
                merged.externalCount || "",
              externalAmount:
                merged.externalAmount || "",
              internalGoal:
                merged.internalGoal || "",
              actions:
                merged.actions || "",
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
  }, [user, selectedMonth, route]);

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
          selectedMonth,
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
        href={`/team-reports/routes/${route}?month=${selectedMonth}`}
        className={`mb-6 inline-block text-sm transition ${
          darkMode
            ? "text-gray-400 hover:text-gray-200"
            : "text-gray-400 hover:text-gray-600"
        }`}
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
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-400">
            班員構成がまだ登録されていません。
          </p>

          <Link
            href={`/team-reports/members?month=${selectedMonth}`}
            className={`mt-4 inline-block text-xs ${
              darkMode
                ? "text-green-400"
                : "text-green-600"
            }`}
          >
            班員構成を登録する →
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {members.map((member, index) => (
            <section
              key={`${member.name}-${index}`}
              className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800/80"
                  : "bg-gray-50"
              }`}
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
                      className={`w-full rounded-2xl border p-4 pr-12 outline-none transition ${
                        darkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
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
                      className={`w-full rounded-2xl border p-4 pr-12 outline-none transition ${
                        darkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
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
                  className={`min-h-32 w-full resize-none rounded-2xl border p-4 outline-none transition ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
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
                  className={`min-h-40 w-full resize-none rounded-2xl border p-4 outline-none transition ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={saveGoals}
            disabled={saving}
            className={`w-full rounded-2xl py-4 text-white transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 hover:bg-gray-700"
            } disabled:opacity-50`}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      )}
    </main>
  );
}