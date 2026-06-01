"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { db, auth } from "../lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function MonthlyGoalsPage() {

  const [user, setUser] =
    useState<any>(null);

  const [darkMode, setDarkMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [innerGoal, setInnerGoal] =
    useState("");

  const [targetCount, setTargetCount] =
    useState("");

  const [targetAmount, setTargetAmount] =
    useState("");

  const [goals, setGoals] =
    useState<any[]>([]);

  const [editingGoal, setEditingGoal] =
  useState<any>(null);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();

  }, []);

  useEffect(() => {

    const savedMode =
      localStorage.getItem(
        "darkMode"
      );

    if (savedMode) {
      setDarkMode(
        JSON.parse(savedMode)
      );
    }

  }, []);

  const fetchGoals = async () => {

  if (!user) return;

  const snapshot =
    await getDocs(
      collection(
        db,
        "users",
        user.uid,
        "monthly_goals"
      )
    );

  const data =
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  data.sort((a, b) =>
    b.id.localeCompare(a.id)
  );

  setGoals(data);
};

useEffect(() => {

  if (!user) return;

  fetchGoals();

}, [user]);


  return (
    <main
      className={`min-h-screen px-4 py-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >

      <div className="mx-auto max-w-xl">

        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/"
            className="text-sm text-gray-400"
          >
            ← ホームへ戻る
          </Link>

          <div className="flex items-center gap-4">

            <span
              className={`text-sm ${
                saving
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            >
              {saving
                ? "保存中..."
                : "保存済み"}
            </span>

            <button
              onClick={() => {

                const newMode =
                  !darkMode;

                setDarkMode(newMode);

                localStorage.setItem(
                  "darkMode",
                  JSON.stringify(
                    newMode
                  )
                );
              }}
            >
              {darkMode
                ? "☀️"
                : "🌙"}
            </button>

          </div>

        </div>

        <h1 className="mb-8 text-3xl font-light">
          月目標
        </h1>

<button
  onClick={() =>
    setShowForm(!showForm)
  }
  className="mb-6 w-full rounded-2xl bg-gray-800 py-4 text-white"
>
  ＋ 新しい月目標を追加
</button>

{showForm && (
  <div
    className={`mb-6 rounded-3xl p-6 shadow-sm ${
      darkMode
        ? "bg-gray-800/80"
        : "bg-gray-50"
    }`}
  >
    <p className="mb-4 text-sm text-gray-400">
      新しい月目標
    </p>

    <input
      type="month"
      value={selectedMonth}
      onChange={(e) =>
        setSelectedMonth(
          e.target.value
        )
      }
      className="mb-4 w-full rounded-2xl border p-4"
    />

    <textarea
      value={innerGoal}
      onChange={(e) =>
        setInnerGoal(
          e.target.value
        )
      }
      placeholder="内的目標"
      className="mb-4 w-full rounded-2xl border p-4"
    />

    <input
      value={targetCount}
      onChange={(e) =>
        setTargetCount(
          e.target.value
        )
      }
      placeholder="件数"
      className="mb-4 w-full rounded-2xl border p-4"
    />

    <input
      value={targetAmount}
      onChange={(e) =>
        setTargetAmount(
          e.target.value
        )
      }
      placeholder="金額"
      className="mb-4 w-full rounded-2xl border p-4"
    />

    <button
  onClick={async () => {

    if (!user) return;

    if (!selectedMonth) {
      alert("対象月を選択してください");
      return;
    }

    const exists =
      goals.find(
        (goal) =>
          goal.id === selectedMonth
      );

    if (exists) {
      alert(
        "この月の目標は既に存在します"
      );
      return;
    }

    setSaving(true);

    await setDoc(
      doc(
        db,
        "users",
        user.uid,
        "monthly_goals",
        selectedMonth
      ),
      {
        month: selectedMonth,
        innerGoal,
        targetCount:
          Number(targetCount),
        targetAmount:
          Number(targetAmount),
        updatedAt:
          new Date(),
      }
    );

    await fetchGoals();

    setInnerGoal("");
    setTargetCount("");
    setTargetAmount("");

    setShowForm(false);

    setSaving(false);

    alert("保存しました");

  }}
  className="w-full rounded-2xl bg-gray-800 py-4 text-white"
>
  保存
</button>

  </div>
)}

      </div>
<div className="mx-auto max-w-xl">

<div className="mt-8 space-y-4">

  {goals.map((goal) => (

    <div
      key={goal.id}
      className={`rounded-3xl p-6 shadow-sm ${
        darkMode
          ? "bg-gray-800/80"
          : "bg-gray-50"
      }`}
    >
  {editingGoal?.id === goal.id ? (

  <div className="space-y-4">

    <textarea
      value={editingGoal.innerGoal}
      onChange={(e) =>
        setEditingGoal({
          ...editingGoal,
          innerGoal: e.target.value,
        })
      }
      className="w-full rounded-2xl border p-4"
    />

    <input
      value={editingGoal.targetCount}
      onChange={(e) =>
        setEditingGoal({
          ...editingGoal,
          targetCount: e.target.value,
        })
      }
      className="w-full rounded-2xl border p-4"
    />

    <input
      value={editingGoal.targetAmount}
      onChange={(e) =>
        setEditingGoal({
          ...editingGoal,
          targetAmount: e.target.value,
        })
      }
      className="w-full rounded-2xl border p-4"
    />
<div className="flex gap-3">

  <button
    onClick={async () => {

      if (!user) return;

      setSaving(true);

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "monthly_goals",
          editingGoal.id
        ),
        {
          ...editingGoal,
          targetCount: Number(
            editingGoal.targetCount
          ),
          targetAmount: Number(
            editingGoal.targetAmount
          ),
          updatedAt: new Date(),
        }
      );

      await fetchGoals();

      setEditingGoal(null);

      setSaving(false);

      alert("更新しました");

    }}
    className="rounded-full bg-gray-800 px-4 py-2 text-sm text-white"
  >
    保存
  </button>

  <button
    onClick={() =>
      setEditingGoal(null)
    }
    className="rounded-full bg-gray-200 px-4 py-2 text-sm"
  >
    キャンセル
  </button>

</div>

  </div>

) : (

  <>
     <p className="text-lg font-medium">
  {goal.month
    .replace("-", "年")
    .concat("月")}
</p>
      <p className="mt-4 text-sm text-gray-400">
        内的目標
      </p>

      <p className="mt-1">
        {goal.innerGoal}
      </p>

      <p className="mt-4 text-sm text-gray-400">
        外的目標
      </p>

      <p className="mt-1">
        {goal.targetCount}件
      </p>

      <p>
        ¥
        {Number(
          goal.targetAmount
        ).toLocaleString()}
      </p>

</>

)}

<div className="mt-6 flex gap-3">

  <button
  onClick={() =>
    setEditingGoal(goal)
  }
  className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700"
>
  編集
</button>

  <button
    onClick={async () => {

      const confirmed =
        window.confirm(
          "この月目標を削除しますか？"
        );

      if (!confirmed) return;

      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "monthly_goals",
          goal.id
        )
      );

      fetchGoals();

    }}
    className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-600"
  >
    削除
  </button>

</div>

    </div>

  ))}
</div>

</div>

    </main>
  );
}