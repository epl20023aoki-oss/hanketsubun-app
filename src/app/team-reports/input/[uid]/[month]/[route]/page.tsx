"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

type Props = {
  params: Promise<{
    uid: string;
    month: string;
    route: string;
  }>;
};

type Member = {
  name: string;
  role?: "班長" | "副班長" | "班員";
};

type MemberInput = {
  targetCount: string;
  targetAmount: string;
  resultCount: string;
  resultAmount: string;
  achieved: "" | "○" | "×";
  victory: string;
  defeat: string;
  externalCount: string;
  externalAmount: string;
  internalGoal: string;
  actions: string;
  updatedAt?: Date;
};

const emptyInput: MemberInput = {
  targetCount: "",
  targetAmount: "",
  resultCount: "",
  resultAmount: "",
  achieved: "",
  victory: "",
  defeat: "",
  externalCount: "",
  externalAmount: "",
  internalGoal: "",
  actions: "",
};

export default function TeamReportInputPage({ params }: Props) {
  const { uid, month, route } = use(params);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedName, setSelectedName] = useState("");

  const [form, setForm] = useState<MemberInput>(emptyInput);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode, mounted]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);

        const teamRef = doc(
          db,
          "users",
          uid,
          "team_reports",
          month
        );

        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          alert("この週間班長レポートが見つかりません");
          return;
        }

        const teamData = teamSnap.data();

        setTeamName(teamData.team || "");

        const rawMembers = Array.isArray(teamData.members)
          ? teamData.members
          : [];

        const normalizedMembers: Member[] = [];

        // 班長
        if (teamData.leader) {
          normalizedMembers.push({
            name: teamData.leader,
            role: "班長",
          });
        }

        // 副班長
        if (teamData.subLeader) {
          normalizedMembers.push({
            name: teamData.subLeader,
            role: "副班長",
          });
        }

        // 班員
        rawMembers.forEach((member: any) => {
          const name =
            typeof member === "string"
              ? member
              : member?.name || "";

          if (name) {
            normalizedMembers.push({
              name,
              role: "班員",
            });
          }
        });

        // 同じ名前が重複している場合は1人にまとめる
        const uniqueMembers = normalizedMembers.filter(
          (member, index, self) =>
            self.findIndex(
              (item) => item.name === member.name
            ) === index
        );

        setMembers(uniqueMembers);

        const routeRef = doc(
          teamRef,
          "routes",
          `route_${route}`
        );

        const routeSnap = await getDoc(routeRef);

        if (routeSnap.exists()) {
          const routeData = routeSnap.data();

          setStartDate(routeData.startDate || "");
          setEndDate(routeData.endDate || "");

          const resultsSnap = await getDoc(
            doc(routeRef, "results", "members")
          );

          const goalsSnap = await getDoc(
            doc(routeRef, "goals", "members")
          );

          const resultsData = resultsSnap.exists()
            ? resultsSnap.data()
            : {};

          const goalsData = goalsSnap.exists()
            ? goalsSnap.data()
            : {};

          if (selectedName) {
            loadMemberData(
              selectedName,
              resultsData,
              goalsData
            );
          }
        }
      } catch (error) {
        console.error("週間レポート読み込みエラー", error);
        alert("読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, month, route]);

  const loadMemberData = (
    name: string,
    resultsData: any,
    goalsData: any
  ) => {
    const result = resultsData[name] || {};
    const goal = goalsData[name] || {};

    setForm({
      targetCount: result.targetCount ?? "",
      targetAmount: result.targetAmount ?? "",
      resultCount: result.resultCount ?? "",
      resultAmount: result.resultAmount ?? "",
      achieved:
        result.achieved === "○" ||
        result.achieved === "×"
          ? result.achieved
          : result.achieved === true
          ? "○"
          : result.achieved === false
          ? "×"
          : "",
      victory: result.victory ?? "",
      defeat: result.defeat ?? "",
      externalCount: goal.externalCount ?? "",
      externalAmount: goal.externalAmount ?? "",
      internalGoal: goal.internalGoal ?? "",
      actions: goal.actions ?? "",
    });

    setSaved(false);
  };

  const handleSelectName = async (
    name: string
  ) => {
    setSelectedName(name);

    if (!name) {
      setForm(emptyInput);
      setSaved(false);
      return;
    }

    try {
      const routeRef = doc(
        db,
        "users",
        uid,
        "team_reports",
        month,
        "routes",
        `route_${route}`
      );

      const resultsSnap = await getDoc(
        doc(routeRef, "results", "members")
      );

      const goalsSnap = await getDoc(
        doc(routeRef, "goals", "members")
      );

      const resultsData = resultsSnap.exists()
        ? resultsSnap.data()
        : {};

      const goalsData = goalsSnap.exists()
        ? goalsSnap.data()
        : {};

      loadMemberData(name, resultsData, goalsData);
    } catch (error) {
      console.error("班員データ読み込みエラー", error);
      alert("入力内容の読み込みに失敗しました");
    }
  };

  const updateField = (
    field: keyof MemberInput,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const saveInput = async () => {
    if (!selectedName) {
      alert("入力する名前を選択してください");
      return;
    }

    try {
      setSaving(true);

      const routeRef = doc(
        db,
        "users",
        uid,
        "team_reports",
        month,
        "routes",
        `route_${route}`
      );

      const resultsRef = doc(
        routeRef,
        "results",
        "members"
      );

      const goalsRef = doc(
        routeRef,
        "goals",
        "members"
      );

      const resultsSnap = await getDoc(resultsRef);
      const goalsSnap = await getDoc(goalsRef);

      const existingResults = resultsSnap.exists()
        ? resultsSnap.data()
        : {};

      const existingGoals = goalsSnap.exists()
        ? goalsSnap.data()
        : {};

      await setDoc(
        resultsRef,
        {
          ...existingResults,
          [selectedName]: {
            targetCount: form.targetCount,
            targetAmount: form.targetAmount,
            resultCount: form.resultCount,
            resultAmount: form.resultAmount,
            achieved: form.achieved,
            victory: form.victory,
            defeat: form.defeat,
          },
          updatedAt: new Date(),
        }
      );

      await setDoc(
        goalsRef,
        {
          ...existingGoals,
          [selectedName]: {
            externalCount: form.externalCount,
            externalAmount: form.externalAmount,
            internalGoal: form.internalGoal,
            actions: form.actions,
          },
          updatedAt: new Date(),
        }
      );

      setSaved(true);
    } catch (error) {
      console.error("班員入力保存エラー", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const [, m, d] = date.split("-");
    return `${Number(m)}月${Number(d)}日`;
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <main
        className={`min-h-screen px-6 py-10 transition-all duration-300 ${
          darkMode
            ? "bg-[#111827] text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-400">
            読み込み中...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-6 py-10 transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-light tracking-wide">
          第{route}次路程
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          {startDate && endDate
            ? `${formatDate(startDate)} ～ ${formatDate(endDate)}`
            : "期間：未設定"}
        </p>

        {teamName && (
          <p className="mt-2 text-sm text-gray-400">
            {teamName}
          </p>
        )}

        <section
          className={`mt-8 rounded-3xl p-6 shadow-sm ${
            darkMode ? "bg-gray-800/80" : "bg-white"
          }`}
        >
          <p className="text-sm text-gray-400">
            入力する名前を選択してください
          </p>

          <select
            value={selectedName}
            onChange={(e) =>
              handleSelectName(e.target.value)
            }
            className={`mt-4 w-full rounded-2xl p-4 outline-none ${
              darkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-50 text-gray-800"
            }`}
          >
            <option value="">
              名前を選択してください
            </option>

            {members.map((member) => (
              <option
                key={member.name}
                value={member.name}
              >
                {member.name}
                {member.role ? `（${member.role}）` : ""}
              </option>
            ))}
          </select>
        </section>

        {selectedName && (
          <section
            className={`mt-6 rounded-3xl p-6 shadow-sm ${
              darkMode ? "bg-gray-800/80" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-medium">
              {selectedName}さんの入力
            </h2>

            {/* 目標 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                目標
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.targetCount}
                  onChange={(e) =>
                    updateField(
                      "targetCount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="件数"
                />

                <span>件</span>

                <input
                  type="number"
                  inputMode="numeric"
                  value={form.targetAmount}
                  onChange={(e) =>
                    updateField(
                      "targetAmount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="金額"
                />

                <span>円</span>
              </div>
            </div>

            {/* 結果 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                結果
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.resultCount}
                  onChange={(e) =>
                    updateField(
                      "resultCount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="件数"
                />

                <span>件</span>

                <input
                  type="number"
                  inputMode="numeric"
                  value={form.resultAmount}
                  onChange={(e) =>
                    updateField(
                      "resultAmount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="金額"
                />

                <span>円</span>
              </div>
            </div>

            {/* 達成 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                達成
              </p>

              <div className="flex gap-3">
                {(["○", "×"] as const).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          achieved: value,
                        }));
                        setSaved(false);
                      }}
                      aria-pressed={form.achieved === value}
                      className={`flex-1 rounded-2xl border-2 py-3 text-lg transition ${
                        form.achieved === value
                          ? darkMode
                            ? "border-green-400 bg-green-800 text-white"
                            : "border-green-500 bg-green-100 text-green-700"
                          : darkMode
                            ? "border-gray-700 bg-gray-700 text-gray-300"
                            : "border-gray-100 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {value}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 勝利点 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                勝利点
              </p>

              <textarea
                value={form.victory}
                onChange={(e) =>
                  updateField(
                    "victory",
                    e.target.value
                  )
                }
                className={`min-h-[140px] w-full rounded-2xl p-4 outline-none ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
                placeholder="勝利点を書いてください"
              />
            </div>

            {/* 敗北点 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                敗北点
              </p>

              <textarea
                value={form.defeat}
                onChange={(e) =>
                  updateField(
                    "defeat",
                    e.target.value
                  )
                }
                className={`min-h-[140px] w-full rounded-2xl p-4 outline-none ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
                placeholder="敗北点を書いてください"
              />
            </div>

            {/* 次回の外的目標 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                次回の外的目標
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.externalCount}
                  onChange={(e) =>
                    updateField(
                      "externalCount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="件数"
                />

                <span>件</span>

                <input
                  type="number"
                  inputMode="numeric"
                  value={form.externalAmount}
                  onChange={(e) =>
                    updateField(
                      "externalAmount",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl p-4 outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-50 text-gray-800"
                  }`}
                  placeholder="金額"
                />

                <span>円</span>
              </div>
            </div>

            {/* 次回の内的目標 */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                次回の内的目標
              </p>

              <textarea
                value={form.internalGoal}
                onChange={(e) =>
                  updateField(
                    "internalGoal",
                    e.target.value
                  )
                }
                className={`min-h-[120px] w-full rounded-2xl p-4 outline-none ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
                placeholder="次回の内的目標を書いてください"
              />
            </div>

            {/* 具体的な取り組み */}
            <div className="mt-8">
              <p className="mb-3 text-sm text-gray-400">
                具体的な取り組み
              </p>

              <textarea
                value={form.actions}
                onChange={(e) =>
                  updateField(
                    "actions",
                    e.target.value
                  )
                }
                className={`min-h-[140px] w-full rounded-2xl p-4 outline-none ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
                placeholder="具体的な取り組みを書いてください"
              />
            </div>

            <button
              type="button"
              onClick={saveInput}
              disabled={saving}
              className={`mt-8 w-full rounded-2xl py-4 text-white transition ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800 hover:bg-gray-700"
              } disabled:opacity-50`}
            >
              {saving ? "保存中..." : "保存する"}
            </button>

            {saved && (
              <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
                ✓ 保存しました。あとからいつでも修正できます。
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
