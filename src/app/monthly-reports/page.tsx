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

    const [submitted, setSubmitted] =
  useState(false);

  const [submittedAt, setSubmittedAt] =
  useState<any>(null);

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

const [
  hasVictoryGenerated,
  setHasVictoryGenerated
] = useState(false);

const [
  hasDefeatGenerated,
  setHasDefeatGenerated
] = useState(false);

const [
  hasTestimonyGenerated,
  setHasTestimonyGenerated
] = useState(false);

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

  if (!user)
    return;

  const timer =
    setTimeout(() => {

      saveReport();

    }, 1000);

  return () =>
    clearTimeout(timer);

}, [
  team,
  name,
  goal,
  actualCount,
  actualAmount,
  victorySummary,
  defeatSummary,
  testimonySummary,
  nextInnerGoal,
  nextTargetCount,
  nextTargetAmount,
  user,
  selectedMonth,
]);

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

  setNextInnerGoal(
  report.nextGoal?.innerGoal || ""
);

setNextTargetCount(
  report.nextGoal?.targetCount?.toString() || ""
);

setNextTargetAmount(
  report.nextGoal?.targetAmount?.toString() || ""
);

setSubmitted(
  report.submitted || false
);
setSubmittedAt(
  report.submittedAt || null
);

setHasVictoryGenerated(
  !!report.victorySummary
);

setHasDefeatGenerated(
  !!report.defeatSummary
);

setHasTestimonyGenerated(
  !!report.testimonySummary
);

} else {

  setActualCount("");
  setActualAmount("");
  setVictorySummary("");
  setDefeatSummary("");
  setTestimonySummary("");
  setNextInnerGoal("");
setNextTargetCount("");
setNextTargetAmount("");

setSubmitted(
  false
);

setSubmittedAt(
  null
);

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
    },
    {
    merge: true
  }
    
  );

  setSaving(false);

 };

const generatePDF = () => {

  console.log("PDF clicked");

  alert("print start");

  window.print();

};


const generateVictory = async () => {

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
      .map((log: any) =>
        log.victory
      )
      .filter(Boolean);

  const response =
    await fetch(
      "/api/generate-section",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          type: "victory",
          data: victories,
        }),
      }
    );

  const data =
    await response.json();

  setVictorySummary(
    data.summary || ""
  );

  setHasVictoryGenerated(
  true
);

  setGenerating(false);

};

const generateDefeat = async () => {

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

  const defeats =
    logs
      .map((log: any) =>
        log.defeat
      )
      .filter(Boolean);

  const response =
    await fetch(
      "/api/generate-section",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          type: "defeat",
          data: defeats,
        }),
      }
    );

  const data =
    await response.json();

  setDefeatSummary(
    data.summary || ""
  );

  setHasDefeatGenerated(
    true
  );

  setGenerating(false);

};

const generateTestimony = async () => {

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

  const testimony =
    logs
      .map((log: any) =>
        log.testimony
      )
      .filter(Boolean);

  const response =
    await fetch(
      "/api/generate-section",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          type: "testimony",
          data: testimony,
        }),
      }
    );

  const data =
    await response.json();

  setTestimonySummary(
  data.summary || ""
);

setHasTestimonyGenerated(
  true
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
        ? "☁ 保存中..."
        : "✓ 保存済み"}
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

{submitted ? (

  <div
    className={`mb-4 rounded-xl px-4 py-2 text-sm ${
      darkMode
        ? "bg-green-900/30 text-green-300"
        : "bg-green-50 text-green-700"
    }`}
  >

    <span className="font-medium">
      ✅ 提出済み
    </span>

    {submittedAt && (
      <span
        className={`ml-3 ${
          darkMode
            ? "text-green-400"
            : "text-green-600"
        }`}
      >
        {submittedAt?.toDate
          ? submittedAt
              .toDate()
              .toLocaleString()
          : submittedAt
              ?.toLocaleString?.()}
      </span>
    )}

  </div>

) : (

  <div
    className={`mb-4 rounded-xl px-4 py-2 text-sm ${
      darkMode
        ? "bg-yellow-900/30 text-yellow-300"
        : "bg-yellow-50 text-yellow-700"
    }`}
  >
    📝 未提出
  </div>

)}

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

<div className="mb-2 flex items-center justify-between">

  <p className="text-sm text-gray-400">
    勝利点
  </p>

  <button
    onClick={() => {

      if (
        hasVictoryGenerated &&
        !window.confirm(
          "現在の勝利点を上書きします。再生成しますか？"
        )
      ) {
        return;
      }

      generateVictory();

    }}
    className={`text-sm ${
      darkMode
        ? "text-blue-300"
        : "text-blue-600"
    }`}
  >
    {hasVictoryGenerated
      ? "🔄 再生成"
      : "🤖 AI生成"}
  </button>

</div>

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

<div className="mb-2 flex items-center justify-between">

  <p className="text-sm text-gray-400">
    敗北点
  </p>

  <button
    onClick={() => {

      if (
        hasDefeatGenerated &&
        !window.confirm(
          "現在の敗北点を上書きします。再生成しますか？"
        )
      ) {
        return;
      }

      generateDefeat();

    }}
    className={`text-sm ${
      darkMode
        ? "text-blue-300"
        : "text-blue-600"
    }`}
  >
    {hasDefeatGenerated
      ? "🔄 再生成"
      : "🤖 AI生成"}
  </button>

</div>

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

<div className="mb-2 flex items-center justify-between">

  <p className="text-sm text-gray-400">
    神様との出会い・証
  </p>

  <button
    onClick={() => {

      if (
        hasTestimonyGenerated &&
        !window.confirm(
          "現在の神様との出会い・証を上書きします。再生成しますか？"
        )
      ) {
        return;
      }

      generateTestimony();

    }}
    className={`text-sm ${
      darkMode
        ? "text-blue-300"
        : "text-blue-600"
    }`}
  >
    {hasTestimonyGenerated
      ? "🔄 再生成"
      : "🤖 AI生成"}
  </button>

</div>

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


<div className="mt-6 flex gap-3">

  
  <button
    onClick={async () => {

      if (!user) return;

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "monthly_reports",
          selectedMonth
        ),
        {
          submitted: true,
          submittedAt:
            new Date(),
        },
        {
          merge: true,
        }
      );

      await setDoc(
        doc(
          db,
          "submitted_reports",
          selectedMonth,
          "users",
          user.uid
        ),
        {
          uid: user.uid,

          name,

          team,

          month: selectedMonth,

          submittedAt:
            new Date(),
        }
      );

      setSubmitted(true);

      setSubmittedAt(
        new Date()
      );

      alert(
        "提出しました"
      );

    }}
    className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
      darkMode
        ? "bg-green-900/30 text-green-300 hover:bg-green-900/50"
        : "bg-green-50 text-green-700 hover:bg-green-100"
    }`}
  >
    提出する
  </button>

</div>

</div>
      </div>

    </main>
  );
}