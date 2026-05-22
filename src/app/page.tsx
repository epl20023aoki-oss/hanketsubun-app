"use client";

import { useEffect, useState } from "react";
import { db, auth } from "./lib/firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";


export default function Home() {
const today = new Date()
  .toISOString()
  .split("T")[0];
  
const [goal, setGoal] = useState("");
const [victory, setVictory] = useState("");
const [defeat, setDefeat] = useState("");
const [testimony, setTestimony] = useState("");
const [actions, setActions] = useState([
  { text: "", checked: false },
]);
const [logs, setLogs] = useState<any[]>([]);

const [user, setUser] = useState<any>(null);

const [selectedTags, setSelectedTags] =
  useState<string[]>([]);

 const fetchLogs = async () => {
  if (!user) return;

    const querySnapshot = await getDocs(
    collection(
  db,
  "users",
  user.uid,
  "daily_logs"
)
    );

    const logsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLogs(logsData);
  };

  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] =
  useState(today);

 useEffect(() => {
    if (!user) return;
    
  const fetchData = async () => {
  

const docRef = doc(
  db,
  "users",
  user.uid,
  "daily_logs",
  selectedDate
);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      setGoal(data.goal || "");
      setVictory(data.victory || "");
      setDefeat(data.defeat || "");
      setTestimony(data.testimony || "");

      setActions(
        data.actions || [
          { text: "", checked: false },
        ]
      );

      setSelectedTags(data.tags || []);
      
    } else {
      setGoal("");
      setVictory("");
      setDefeat("");
      setTestimony("");

      setActions([
        { text: "", checked: false },
        
      ]);
    }
  };

  fetchData();

 

  fetchLogs();
}, [selectedDate, user]);

const changeDate = (days: number) => {
  const current = new Date(selectedDate);

  current.setDate(current.getDate() + days);

  const newDate = current
    .toISOString()
    .split("T")[0];

    setGoal("");
setVictory("");
setDefeat("");
setTestimony("");
setActions([
  { text: "", checked: false },
]);

  setSelectedDate(newDate);
};

useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (currentUser) => {
      console.log("認証状態", currentUser);

      setUser(currentUser);
    }
  );

  return () => unsubscribe();
}, []);

const login = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    console.log(result.user);
  } catch (error) {
    console.log("ログインエラー", error);
  }
};

const logout = async () => {
  await signOut(auth);
};

const tags = [
"重要",
"証",
"祈り",
"人間関係",
"感謝",
"葛藤",
];

return (
  <main className="min-h-screen bg-white text-gray-800">

  
{/* 上部バー */} 
<header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur"> 
<div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
   <button className="text-sm text-gray-500">
← 戻る </button>

      <h1 className="text-sm font-medium">
        5月の振り返り
      </h1>

      <span className="text-xs text-gray-400">
  {saving ? "保存中..." : "保存済み"}
      </span>

 <p className="text-xs">
    {user ? "ログイン中" : "未ログイン"}
  </p>

   {user ? (
  <button
    onClick={logout}
    className="rounded-full bg-red-500 px-4 py-2 text-xs text-white"
  >
    ログアウト
  </button>
) : (
  <button
    onClick={login}
    className="rounded-full bg-gray-900 px-4 py-2 text-xs text-white"
  >
    Googleログイン
  </button>
)}

<p className="text-xs text-gray-500">
  {user?.displayName}
</p>

    </div>
  </header>

  {/* 本文 */}
  <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8">
    {/* 日付 */}
    <section>
     <div className="mb-2 flex items-center gap-4 text-sm text-gray-400">
  <button
    onClick={() => changeDate(-1)}
    className="rounded-full px-2 py-1 hover:bg-gray-100"
  >
    
    ◀
  </button>

  <p>{selectedDate}</p>

  <button
    onClick={() => changeDate(1)}
    className="rounded-full px-2 py-1 hover:bg-gray-100"
  >
    ▶
  </button>
</div>

      <h2 className="text-3xl font-light tracking-wide">
        今日の振り返り
      </h2>
    </section>

    {/* 今日の目標 */}
    <section className="space-y-3">
      <h3 className="text-lg font-medium">
        今日の目標
      </h3>
{user && (
<textarea
  value={goal}
  onChange={async (e) => {
    setGoal(e.target.value);

    setSaving(true);

    console.log("user確認", user);

if (!user?.uid) {
  console.log("userなし");
  return;
}

console.log("保存開始");

    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "daily_logs",
          selectedDate
        ),
        {
          goal: e.target.value,
          victory,
          defeat,
          testimony,
          actions,
          tags: selectedTags,
          date: selectedDate,
          updatedAt: new Date(),
        }
      );

      console.log("保存成功");

      fetchLogs();

      localStorage.setItem(
        "goal",
        e.target.value
      );
    } catch (error) {
      console.log("保存エラー", error);
    }

    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }}
  className="min-h-[120px] w-full rounded-2xl bg-gray-50 p-5 outline-none"
  placeholder={
  user
    ? "今日はどんな1日にしたいですか？"
    : "Googleログインしてください"
}
/>
)}

    </section>

    {/* アクションプラン */}
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          今日のアクションプラン
        </h3>

       <button
  className="text-sm text-gray-400"
  onClick={() => {
    setActions([
      ...actions,
      { text: "", checked: false },
    ]);
  }}
>
  ＋追加
</button>
      </div>

      <div className="space-y-3 rounded-2xl bg-gray-50 p-5">
  {actions.map((action, index) => (
    <label
      key={index}
      className="flex items-center gap-3"
    >
      <input
        type="checkbox"
        checked={action.checked}
       onChange={async (e) => {
          const updated = [...actions];

          updated[index].checked =
            !updated[index].checked;

          if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
  goal,
  victory,
  defeat: e.target.value,
  testimony,
  actions,
  tags: selectedTags,
  date: selectedDate,
  updatedAt: new Date(),
});

fetchLogs();

        }}
      />

      <input
        value={action.text}
       onChange={async (e) => {
          const updated = [...actions];

          updated[index].text = e.target.value;

          setActions(updated);

  setSaving(true); 

          if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
  goal,
  victory,
  defeat: e.target.value,
  testimony,
  actions,
  tags: selectedTags,
  date: selectedDate,
  updatedAt: new Date(),
});

fetchLogs();

        }}
        className="w-full bg-transparent outline-none"
        placeholder="アクションを入力"
      />
    </label>
  ))}
</div>
    </section>

    {/* 勝利点 */}
    <section className="space-y-3">
      <h3 className="text-lg font-medium">
        勝利点
      </h3>

      <textarea
  value={victory}
  onChange={async (e) => {
    setVictory(e.target.value);

  setSaving(true); 

    if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
  goal,
  victory,
  defeat: e.target.value,
  testimony,
  actions,
  tags: selectedTags,
  date: selectedDate,
  updatedAt: new Date(),
});

fetchLogs();

    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }}
  className="min-h-[180px] w-full rounded-2xl bg-gray-50 p-5 outline-none"
  placeholder="今日の勝利や感謝を書いてみましょう"
/>
    </section>

    {/* 敗北点 */}
    <section className="space-y-3">
      <h3 className="text-lg font-medium">
        敗北点
      </h3>

     <textarea
  value={defeat}
 onChange={async (e) => {
    setDefeat(e.target.value);

     setSaving(true);

    if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
  goal,
  victory,
  defeat: e.target.value,
  testimony,
  actions,
  tags: selectedTags,
  date: selectedDate,
  updatedAt: new Date(),
});

   fetchLogs();

    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }}
  className="min-h-[180px] w-full rounded-2xl bg-gray-50 p-5 outline-none"
  placeholder="悔しかったことや葛藤を書いてみましょう"
/>
    </section>

    {/* 神様との出会い・証 */}
    <section className="space-y-3">
      <h3 className="text-lg font-medium">
        神様との出会い・証
      </h3>

      <textarea
  value={testimony}
  onChange={async (e) => {
    setTestimony(e.target.value);

  setSaving(true);

    if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
  goal,
  victory,
  defeat: e.target.value,
  testimony,
  actions,
  tags: selectedTags,
  date: selectedDate,
  updatedAt: new Date(),
});

  fetchLogs();

    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }}
  className="min-h-[180px] w-full rounded-2xl bg-gray-50 p-5 outline-none"
  placeholder="今日感じたことを書いてみましょう"
/>
    </section>

    {/* タグ */}
    <section className="space-y-4">
      <h3 className="text-lg font-medium">
        タグ
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
         <button
  key={tag}
  onClick={async () => {
    let updatedTags = [...selectedTags];

    if (selectedTags.includes(tag)) {
      updatedTags = updatedTags.filter(
        (t) => t !== tag
      );
    } else {
      updatedTags.push(tag);
    }

    setSelectedTags(updatedTags);

    if (!user) return;

await setDoc(
  doc(
    db,
    "users",
    user.uid,
    "daily_logs",
    selectedDate
  ), {
      goal,
      victory,
      defeat,
      testimony,
      actions,
      tags: updatedTags,
      date: selectedDate,
      updatedAt: new Date(),
    });

    fetchLogs();
  }}
  className={`rounded-full px-4 py-2 text-sm transition ${
    selectedTags.includes(tag)
      ? "bg-gray-800 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
  }`}
>
  #{tag}
</button>
        ))}
      </div>

      <input
        className="w-full rounded-2xl bg-gray-50 p-4 outline-none"
        placeholder="自由タグを追加"
      />
    </section>

    <section className="space-y-4">
  <h3 className="text-lg font-medium">
    過去の記録
  </h3>

  <div className="space-y-2">
    {logs.map((log) => (
      <div
  key={log.id}
  onClick={() => {
    setSelectedDate(log.id);
  }}
        className="cursor-pointer rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100"
      >
        <p className="text-sm text-gray-400">
          {log.date}
        </p>

        <p className="mt-1 line-clamp-2">
          {log.goal}
        </p>
      </div>
    ))}
  </div>
</section>

  </div>
</main>
);
}
