"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function TeamMembersPage() {
  const [team, setTeam] = useState("");
  const [leader, setLeader] = useState("");
  const [subLeader, setSubLeader] = useState("");
  const [members, setMembers] = useState([""]);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // URLから対象月を取得
  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);

  const [year, month] =
    selectedMonth.split("-");

  // URLのmonthを読み込む
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const monthParam = params.get("month");

    if (monthParam) {
      setSelectedMonth(monthParam);
    }
  }, []);

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
      const docRef = doc(
        db,
        "users",
        user.uid,
        "team_reports",
        selectedMonth
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setTeam(data.team || "");
        setLeader(data.leader || "");
        setSubLeader(data.subLeader || "");
        setMembers(
          data.members &&
          data.members.length > 0
            ? data.members
            : [""]
        );
      } else {
        setTeam("");
        setLeader("");
        setSubLeader("");
        setMembers([""]);
      }
    };

    fetchTeamMembers();
  }, [user, selectedMonth]);

  const addMember = () => {
    setMembers([...members, ""]);
  };

  const updateMember = (
    index: number,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const saveTeamMembers = async () => {
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
          selectedMonth
        ),
        {
          team,
          leader,
          subLeader,
          members,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      alert("班員構成を保存しました");
    } catch (error) {
      console.error(
        "班員構成の保存エラー",
        error
      );

      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <main
      className={`mx-auto min-h-screen max-w-2xl px-6 py-10 transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Link
        href={`/team-reports?month=${selectedMonth}`}
        className={`mb-6 inline-block text-sm transition ${
          darkMode
            ? "text-gray-400 hover:text-gray-200"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        ← 週間班長レポートへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        班員構成
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        {year}年{Number(month)}月の班員構成
      </p>

      {/* 班 */}
      <section className="mb-6">
        <div
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            班
          </p>

          <input
            value={team}
            onChange={(e) =>
              setTeam(e.target.value)
            }
            className={`w-full rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
            placeholder="班名を入力"
          />
        </div>
      </section>

      <div className="space-y-6">

        {/* 班長 */}
        <section>
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-gray-50"
            }`}
          >
            <p className="mb-3 text-sm text-gray-400">
              班長
            </p>

            <input
              value={leader}
              onChange={(e) =>
                setLeader(e.target.value)
              }
              className={`w-full rounded-2xl border p-4 outline-none transition ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              placeholder="班長の名前"
            />
          </div>
        </section>

        {/* 副班長 */}
        <section>
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-gray-50"
            }`}
          >
            <p className="mb-3 text-sm text-gray-400">
              副班長
            </p>

            <input
              value={subLeader}
              onChange={(e) =>
                setSubLeader(e.target.value)
              }
              className={`w-full rounded-2xl border p-4 outline-none transition ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              placeholder="副班長の名前"
            />
          </div>
        </section>

        {/* 班員 */}
        <section>
          <div
            className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80"
                : "bg-gray-50"
            }`}
          >
            <p className="mb-4 text-sm text-gray-400">
              班員
            </p>

            <div className="space-y-3">
              {members.map((member, index) => (
                <input
                  key={index}
                  value={member}
                  onChange={(e) =>
                    updateMember(
                      index,
                      e.target.value
                    )
                  }
                  className={`w-full rounded-2xl border p-4 outline-none transition ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder={`班員 ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addMember}
              className={`mt-4 text-sm ${
                darkMode
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              ＋ 班員を追加
            </button>
          </div>
        </section>

        {/* 保存 */}
        <button
          type="button"
          onClick={saveTeamMembers}
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
    </main>
  );
}