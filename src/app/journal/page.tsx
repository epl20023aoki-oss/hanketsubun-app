"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";
import { db, auth } from "../lib/firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Link from "next/link";


import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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
 .toLocaleDateString("sv-SE")

 const [showCalendar, setShowCalendar] =
  useState(false);
const [goal, setGoal] = useState("");
const [victory, setVictory] = useState("");
const [defeat, setDefeat] = useState("");
const [testimony, setTestimony] = useState("");
const [filterTag, setFilterTag] =
  useState("");
  const [reflection, setReflection] =
  useState("");
const [actions, setActions] = useState([
  { text: "", checked: false },
]);
const [darkMode, setDarkMode] =
  useState(false);
const [logs, setLogs] = useState<any[]>([]);


const [user, setUser] =
  useState<any>(null);

useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {

        console.log(
          "認証状態",
          currentUser
        );

        setUser(currentUser);
      }
    );

  return () => unsubscribe();

}, []);

const reflectionRef =
  useRef<HTMLTextAreaElement>(null);

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
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

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
      setTestimony(data.testimony || ""); const savedReflection = localStorage.getItem( `reflection-${user?.uid}-${selectedDate}` ); setReflection( savedReflection || data.reflection || "" );

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

  console.log(
     `reflection-${user?.uid}-${selectedDate}` 
    );

 const savedReflection =
    localStorage.getItem(
  `reflection-${user?.uid}-${selectedDate}`
);

  if (savedReflection) {
    setReflection(savedReflection);
  }

  fetchLogs();
}, [selectedDate, user]);

const changeDate = (days: number) => {
  const current = new Date(selectedDate);

  current.setDate(current.getDate() + days);

  const newDate = current
    .toLocaleDateString("sv-SE")

    setGoal("");
setVictory("");
setDefeat("");
setTestimony("");
setActions([
  { text: "", checked: false },
]);

setSelectedTags([]);

setFilterTag("");

  setSelectedDate(newDate);
};

const tags = [
"重要",
"証",
"祈り",
"人間関係",
"感謝",
"葛藤",
];

useEffect(() => {

  const textarea =
    reflectionRef.current;

  if (!textarea) return;

  textarea.style.height =
    "auto";

  textarea.style.height =
    textarea.scrollHeight + "px";

}, [reflection]);

return (
  <main
  className={`mx-auto min-h-screen max-w-2xl px-4 py-10 transition-all duration-300 ${
    darkMode
      ? "bg-[#111827] text-white"
      : "bg-white text-gray-800"
  }`}
>
  
<header className="mb-10">
  <h1 className="text-3xl font-light tracking-wide">
    あしあと
  </h1>

  <p className="mt-2 text-sm text-gray-400">
    今日の歩みを次に繋げる
  </p>
</header>   
  
{/* 上部バー */} 
<header
  className={`sticky top-0 z-10 border-b backdrop-blur transition-all ${
    darkMode
      ? "border-gray-800 bg-gray-900/80"
      : "border-gray-200 bg-white/80"
  }`}
>

    <div className="flex items-center justify-between">
      
<div className="flex flex-col">

  <Link
    href="/"
    className={`text-sm ${
      darkMode
        ? "text-gray-200"
        : "text-gray-500"
    }`}
  >
    ← ホーム
  </Link>

  <span
    className={`mt-1 text-xs ${
      darkMode
        ? "text-gray-400"
        : "text-gray-400"
    }`}
  >
    {saving
      ? "☁ 保存中..."
      : "✓ 保存済み"}
  </span>

</div>

      <h1 className="text-sm font-medium">
        5月の振り返り
      </h1>

      <button
        onClick={() =>
          setDarkMode(!darkMode)
        }
        className="rounded-full bg-gray-200 px-3 py-1 text-xs rounded-full"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>

    <div
  className={`flex items-center justify-between text-xs ${
    darkMode
      ? "text-gray-200"
      : "text-gray-400"
  }`}
>


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

    <button
      onClick={() =>
        setShowCalendar(
          !showCalendar
        )
      }
      className="rounded-full px-3 py-1 hover:bg-gray-100"
    >
      📅 {selectedDate}
    </button>

    <button
      onClick={() => changeDate(1)}
      className="rounded-full px-2 py-1 hover:bg-gray-100"
    >
      ▶
    </button>

  </div>

  {showCalendar && (
    <div className="mb-4">
      <Calendar
        onChange={(value) => {

          const date =
            new Date(value as Date)
              .toLocaleDateString(
                "sv-SE"
              );

          setSelectedDate(date);

          setShowCalendar(false);
        }}
        value={
          new Date(selectedDate)
        }
      />
    </div>
  )}

</section>

      <h2 className="text-3xl font-light tracking-wide">
        今日の振り返り
      </h2>

    {/* 今日の目標 */}
    <section className="space-y-6">
      <h3 className="text-lg font-medium">
        今日の目標
      </h3>
{user && (
  <>
    <textarea
  value={goal}
  onChange={async (e) => {
    setGoal(e.target.value);

    setSaving(true);

    setSaving(true);

console.log(
  "保存開始",
  user
);

    if (!auth.currentUser?.uid) return;

    try {
       await setDoc(
    doc(
      db,
      "users",
      auth.currentUser.uid,
      "daily_logs",
      selectedDate
    ),
        {
          goal: e.target.value,
          reflection,
          victory,
          defeat,
          testimony,
          actions,
          tags: selectedTags,
          date: selectedDate,
          updatedAt: new Date(),
        }
      );

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
  className={`min-h-[120px] w-full rounded-2xl p-5 shadow-sm outline-none placeholder:text-gray-400 transition-all duration-200 focus:ring-2 ${
    darkMode
      ? "bg-gray-800/80 text-white focus:ring-gray-600"
      : "bg-gray-50 text-gray-800 focus:ring-gray-300"
  }`}
  placeholder={
    user
      ? "今日はどんな1日にしたいですか？"
      : "Googleログインしてください"
  }
/>

<div
  className={`rounded-2xl p-4 transition-all duration-300 focus-within:ring-2 ${
    darkMode
      ? "bg-gray-800/40 focus-within:ring-gray-600"
      : "bg-gray-50 focus-within:ring-gray-200"
  }`}
>
  <textarea
  ref={reflectionRef}
    value={reflection}
    onChange={(e) =>
      setReflection(e.target.value)
    }
    placeholder="今日意識したいみ言など..."
    onInput={(e) => {
      e.currentTarget.style.height = "auto";
      e.currentTarget.style.height =
        e.currentTarget.scrollHeight + "px";
    }}
    
    className={`w-full resize-none overflow-hidden bg-transparent text-sm leading-7 outline-none placeholder:text-gray-300 ${
      darkMode
        ? "text-white"
        : "text-gray-800"
    }`}
  />
</div>
  </>
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

  <div
    className={`space-y-3 rounded-2xl p-5 shadow-sm placeholder:text-gray-400 transition-all duration-300 focus-within:ring-2 ${
      darkMode
        ? "bg-gray-800/80 focus-within:ring-gray-600"
        : "bg-gray-50 focus-within:ring-gray-300"
    }`}
  >
    {actions.map((action, index) => (
      <label
        key={index}
        className="flex items-center gap-3"
      >
        <input
          type="checkbox"
          checked={action.checked}
          onChange={async () => {

            const updated = [...actions];

            updated[index].checked =
              !updated[index].checked;

            setActions(updated);

            if (!user) return;

            await setDoc(
              doc(
                db,
                "users",
                user.uid,
                "daily_logs",
                selectedDate
              ),
              {
                goal,
                reflection,
                victory,
                defeat,
                testimony,
                actions: updated,
                tags: selectedTags,
                date: selectedDate,
                updatedAt: new Date(),
              }
            );

            fetchLogs();
          }}
        />

        <input
          value={action.text}
          onChange={async (e) => {

            const updated = [...actions];

            updated[index].text =
              e.target.value;

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
              ),
              {
                goal,
                reflection,
                victory,
                defeat,
                testimony,
                actions: updated,
                tags: selectedTags,
                date: selectedDate,
                updatedAt: new Date(),
              }
            );

            fetchLogs();

            setTimeout(() => {
              setSaving(false);
            }, 1000);
          }}
          className="w-full bg-transparent outline-none"
          placeholder="アクションを入力"
        />
      </label>
    ))}
  </div>
    </section>

    {/* 勝利点 */}
    <section className="space-y-6">
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
  victory: e.target.value,
  defeat,
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
  className={`min-h-[180px] w-full rounded-2xl p-5 shadow-sm outline-none placeholder:text-gray-400 transition-all duration-200 focus:ring-2 ${
  darkMode
    ? "bg-gray-800/80 text-white focus:ring-gray-600"
    : "bg-gray-50 text-gray-800 focus:ring-gray-300"
}`}
  placeholder="今日の勝利や感謝を書いてみましょう"
/>
    </section>

    {/* 敗北点 */}
    <section className="space-y-6">
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
 className={`min-h-[180px] w-full rounded-2xl p-5 shadow-sm outline-none placeholder:text-gray-400 transition-all duration-200 focus:ring-2 ${
  darkMode
    ? "bg-gray-800/80 text-white focus:ring-gray-600"
    : "bg-gray-50 text-gray-800 focus:ring-gray-300"
}`}

  placeholder="悔しかったことや葛藤を書いてみましょう"
/>
    </section>

    {/* 神様との出会い・証 */}
    <section className="space-y-6">
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
  defeat,
  testimony: e.target.value,
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
  className={`min-h-[180px] w-full rounded-2xl p-5 shadow-sm outline-none placeholder:text-gray-400 transition-all duration-200 focus:ring-2 ${
  darkMode
    ? "bg-gray-800/80 text-white focus:ring-gray-600"
    : "bg-gray-50 text-gray-800 focus:ring-gray-300"
}`}

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
  className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
    selectedTags.includes(tag)
      ? "bg-gray-800/80 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
  }`}
>
  #{tag}
</button>
        ))}
      </div>

      <input
        className={`w-full rounded-2xl p-4 shadow-sm outline-none placeholder:text-gray-400 ${
  darkMode
    ? "bg-gray-800/80 text-white"
    : "bg-gray-50 text-gray-800"
}`}

        placeholder="自由タグを追加"
      />
    </section>

    <section className="space-y-4">

<div className="flex flex-wrap gap-2">
  {tags.map((tag) => (
    <button
      key={tag}
      onClick={() =>
        setFilterTag(tag)
      }
      className={`rounded-full px-4 py-2 text-sm ${
        filterTag === tag
          ? "bg-gray-800/80 text-white"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      #{tag}
    </button>
  ))}

  <button
    onClick={() => setFilterTag("")}
    className="rounded-full bg-red-100 px-4 py-2 text-sm"
  >
    解除
  </button>
</div>

  <h3 className="text-lg font-medium">
    
    過去の記録
  </h3>

  <div className="space-y-2">
  {logs
  .filter((log) => {
    if (!filterTag) return true;

    return log.tags?.includes(filterTag);
  })
  .sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  )
  .slice(0, 7)
  .map((log) => (

      <div
  key={log.id}
  onClick={() => {
    setSelectedDate(log.id);
  }}
        className={`cursor-pointer rounded-2xl p-4 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5 placeholder:text-gray-400 ${
  darkMode
    ? "bg-gray-800/80 text-white"
    : "bg-gray-50 text-gray-800"
}`}

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
