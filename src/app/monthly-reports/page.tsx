"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { db, auth } from "../lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { useRef } from "react";


export default function MonthlyReportsPage() {

  const [user, setUser] =
    useState<any>(null);

  const [darkMode, setDarkMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [team, setTeam] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 7)
    );

  const [goal, setGoal] =
    useState<any>(null);

  const [actualCount, setActualCount] =
    useState("");

  const [actualAmount, setActualAmount] =
    useState("");

  const [victorySummary, setVictorySummary] =
    useState("");

  const [defeatSummary, setDefeatSummary] =
    useState("");

  const [testimonySummary, setTestimonySummary] =
    useState("");

    const [generating, setGenerating] =
  useState(false);

const [
  nextInnerGoal,
  setNextInnerGoal
] = useState("");

const [
  nextTargetCount,
  setNextTargetCount
] = useState("");

const [
  nextTargetAmount,
  setNextTargetAmount
] = useState("");


  const reportRef =
  useRef<HTMLDivElement>(null);

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

  useEffect(() => {

    if (!user) return;

    const fetchData = async () => {

      const profileSnap =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      if (
        profileSnap.exists()
      ) {

        const profile =
          profileSnap.data();

        setName(
          profile.name || ""
        );

        setTeam(
          profile.team || ""
        );

      }

      const goalSnap =
        await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "monthly_goals",
            selectedMonth
          )
        );

      if (
        goalSnap.exists()
      ) {

        setGoal(
          goalSnap.data()
        );

      }

      const reportSnap =
  await getDoc(
    doc(
      db,
      "users",
      user.uid,
      "monthly_reports",
      selectedMonth
    )
  );

if (
  reportSnap.exists()
) {

  const report =
    reportSnap.data();

  setActualCount(
    report.actualCount?.toString() || ""
  );

  setActualAmount(
    report.actualAmount?.toString() || ""
  );

  setVictorySummary(
    report.victorySummary || ""
  );

  setDefeatSummary(
    report.defeatSummary || ""
  );

  setTestimonySummary(
    report.testimonySummary || ""
  );

} else {

  setActualCount("");
  setActualAmount("");
  setVictorySummary("");
  setDefeatSummary("");
  setTestimonySummary("");

}

    };

    fetchData();

  }, [
    user,
    selectedMonth,
  ]);

  const saveReport = async () => {

  if (!user) return;

  setSaving(true);

  await setDoc(
    doc(
      db,
      "users",
      user.uid,
      "monthly_reports",
      selectedMonth
    ),
    {
      month: selectedMonth,

      team,
      name,

      goal,

      actualCount:
        Number(actualCount),

      actualAmount:
        Number(actualAmount),

      victorySummary,

      defeatSummary,

      testimonySummary,

 nextGoal: {
      innerGoal:
        nextInnerGoal,

      targetCount:
        Number(
          nextTargetCount
        ),

      targetAmount:
        Number(
          nextTargetAmount
        ),
    },


      updatedAt:
        new Date(),
    }
  );

  setSaving(false);

  alert("保存しました");
};

const generatePDF = () => {

  console.log("PDF clicked");

  alert("print start");

  window.print();

};

const generateDraft =
  async () => {

    if (!user) return;

    setGenerating(true);

    const snapshot =
      await getDocs(
        collection(
          db,
          "users",
          user.uid,
          "daily_logs"
        )
      );

    const logs =
      snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((log: any) =>
          log.id.startsWith(
            selectedMonth
          )
        );

        const victories =
  logs
    .map(
      (log: any) =>
        log.victory
    )
    .filter(Boolean);

const defeats =
  logs
    .map(
      (log: any) =>
        log.defeat
    )
    .filter(Boolean);

const testimonies =
  logs
    .map(
      (log: any) =>
        log.testimony
    )
    .filter(Boolean);

console.log(
  "勝利点",
  victories
);

console.log(
  "敗北点",
  defeats
);

console.log(
  "証",
  testimonies
);

    console.log(
      "対象月の日記",
      logs
    );

    setVictorySummary(

  victories.length > 0
    ? `今月は${victories.length}件の勝利記録がありました。\n\n${victories.join(
        "\n"
      )}`
    : ""

);

setDefeatSummary(

  defeats.length > 0
    ? `今月の課題として記録された内容です。\n\n${defeats.join(
        "\n"
      )}`
    : ""

);

setTestimonySummary(

  testimonies.length > 0
    ? `今月の神様との出会い・証を時系列で整理しました。\n\n${testimonies.join(
        "\n"
      )}`
    : ""

);

setGenerating(false);

alert(
  "下書きを生成しました"
);

    setGenerating(false);
  };

const callAI = async () => {

  if (!user) return;

  setGenerating(true);

  const snapshot =
    await getDocs(
      collection(
        db,
        "users",
        user.uid,
        "daily_logs"
      )
    );

  const logs =
    snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((log: any) =>
        log.id.startsWith(
          selectedMonth
        )
      );

  const victories =
    logs
      .map((log: any) => log.victory)
      .filter(Boolean);

  const defeats =
    logs
      .map((log: any) => log.defeat)
      .filter(Boolean);

  const testimonies =
    logs
      .map((log: any) => log.testimony)
      .filter(Boolean);

  const response =
    await fetch(
      "/api/generate-report",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          victories,
          defeats,
          testimonies,
        }),
      }
    );

  const data =
    await response.json();

  console.log(data);

  setVictorySummary(
    data.victorySummary || ""
  );

  setDefeatSummary(
    data.defeatSummary || ""
  );

  setTestimonySummary(
    data.testimonySummary || ""
  );

  setGenerating(false);

};


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

                setDarkMode(
                  newMode
                );

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
          月末レポート
        </h1>

<div
  ref={reportRef}
  style={{
    backgroundColor: "#ffffff",
    color: "#000000",
  }}
  className="rounded-3xl p-6"
>

  <p className="mb-2 text-sm text-gray-400">
    対象月
  </p>

  <input
    type="month"
    value={selectedMonth}
    onChange={(e) =>
      setSelectedMonth(
        e.target.value
      )
    }
    className="mb-6 w-full rounded-2xl border p-4"
  />

  <p className="text-sm text-gray-400">
    班
  </p>

  <p className="mb-4 mt-1 text-lg">
    {team || "-"}
  </p>

  <p className="text-sm text-gray-400">
    名前
  </p>

  <p className="mb-6 mt-1 text-lg">
    {name || "-"}
  </p>

  <p className="text-sm text-gray-400">
    今月の目標
  </p>

  {goal ? (
    <>
      <p className="mt-4 text-sm text-gray-400">
        内的目標
      </p>

      <p className="mt-1">
        {goal.innerGoal}
      </p>

      <p className="mt-4 text-sm text-gray-400">
        目標件数
      </p>

      <p className="mt-1">
        {goal.targetCount}件
      </p>

      <p className="mt-4 text-sm text-gray-400">
        目標金額
      </p>

      <p className="mt-1">
        ¥
        {Number(
          goal.targetAmount
        ).toLocaleString()}
      </p>
    </>
  ) : (
    <p className="mt-4 text-gray-400">
      月目標がありません
    </p>
  )}

<hr className="my-8" />

<p className="mb-2 text-sm text-gray-400">
  実績件数
</p>

<div className="mb-6 flex items-center gap-3">

  <span>
    {goal?.targetCount || 0}件 →
  </span>

  <input
    value={actualCount}
    onChange={(e) =>
      setActualCount(
        e.target.value
      )
    }
    className="flex-1 rounded-2xl border p-3"
    placeholder="実績件数"
  />

</div>

<p className="mb-2 text-sm text-gray-400">
  実績金額
</p>

<div className="mb-6 flex items-center gap-3">

  <span>
    ¥
    {Number(
      goal?.targetAmount || 0
    ).toLocaleString()}
    →
  </span>

  <input
    value={actualAmount}
    onChange={(e) =>
      setActualAmount(
        e.target.value
      )
    }
    className="flex-1 rounded-2xl border p-3"
    placeholder="実績金額"
  />

</div>

<p className="mb-2 text-sm text-gray-400">
  勝利点
</p>

<textarea
  value={victorySummary}
  onChange={(e) =>
    setVictorySummary(
      e.target.value
    )
  }
  className="mb-6 w-full rounded-2xl border p-4"
  rows={6}
/>

<p className="mb-2 text-sm text-gray-400">
  敗北点
</p>

<textarea
  value={defeatSummary}
  onChange={(e) =>
    setDefeatSummary(
      e.target.value
    )
  }
  className="mb-6 w-full rounded-2xl border p-4"
  rows={6}
/>

<p className="mb-2 text-sm text-gray-400">
  神様との出会い・証
</p>

<textarea
  value={testimonySummary}
  onChange={(e) =>
    setTestimonySummary(
      e.target.value
    )
  }
  className="w-full rounded-2xl border p-4"
  rows={8}
/>

<hr className="my-8" />

<h2 className="mb-4 text-xl">
  来月の目標
</h2>

<p className="mb-2 text-sm text-gray-400">
  内的目標
</p>

<textarea
  value={nextInnerGoal}
  onChange={(e) =>
    setNextInnerGoal(
      e.target.value
    )
  }
  className="mb-6 w-full rounded-2xl border p-4"
/>

<p className="mb-2 text-sm text-gray-400">
  目標件数
</p>

<input
  value={nextTargetCount}
  onChange={(e) =>
    setNextTargetCount(
      e.target.value
    )
  }
  className="mb-6 w-full rounded-2xl border p-4"
/>

<p className="mb-2 text-sm text-gray-400">
  目標金額
</p>

<input
  value={nextTargetAmount}
  onChange={(e) =>
    setNextTargetAmount(
      e.target.value
    )
  }
  className="w-full rounded-2xl border p-4"
/>


<button
 onClick={callAI}
  className="mt-6 mb-3 w-full rounded-2xl bg-blue-600 py-4 text-white"
>
  {generating
    ? "生成中..."
    : "AIで下書きを作る"}
</button>

<button
  onClick={saveReport}
  className="mt-6 w-full rounded-2xl bg-gray-800 py-4 text-white"
>
  保存
</button>

<button
  onClick={() => {
    window.open(
      `/monthly-reports/pdf?month=${selectedMonth}`,
      "_blank"
    );
  }}
  className="mt-3 w-full rounded-2xl bg-blue-600 py-4 text-white"
>
  PDF出力
</button>

</div>
      </div>

    </main>
  );
}