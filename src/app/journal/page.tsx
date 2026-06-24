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
  addDoc,
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
const [
  testimonySubmitted,
  setTestimonySubmitted
] = useState(false);

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
const recordedDates = logs.map(
  (log) => log.id
);

const recordedDateSet =
  new Set(recordedDates);

const [user, setUser] =
  useState<any>(null);

const [name, setName] =
  useState("");

const [team, setTeam] =
  useState("");

useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (currentUser) => {

        console.log(
          "認証状態",
          currentUser
        );

        setUser(currentUser);
        if (!currentUser)
  return;

const tagDoc =
  await getDoc(
    doc(
      db,
      "users",
      currentUser.uid,
      "settings",
      "custom_tags"
    )
  );

if (
  tagDoc.exists()
) {

  setCustomTags(
    tagDoc.data().tags || []
  );

}

console.log(
  "name:",
  name
);

console.log(
  "team:",
  team
);

const profileSnap =
  await getDoc(
    doc(
      db,
      "users",
      currentUser.uid
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

const submitTestimony = async () => {

  if (!user) return;

  if (!testimony.trim()) {

    alert(
      "証を入力してください"
    );

    return;

  }

  const confirmed =
    window.confirm(
      "この証をスタッフへ提出しますか？"
    );

  if (!confirmed) return;

  const profileSnap =
    await getDoc(
      doc(
        db,
        "users",
        user.uid
      )
    );

  const profile =
    profileSnap.data();

  await addDoc(
    collection(
      db,
      "submitted_testimonies"
    ),
    {
      uid: user.uid,
      name:
        profile?.name || "",
      team:
        profile?.team || "",
      testimony,
      date: selectedDate,
      submittedAt:
        new Date(),
    }
  );

  setTestimonySubmitted(
  true
);

  alert(
    "証を提出しました"
  );

};

  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] =
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

useEffect(() => {

  const checkSubmitted =
    async () => {

      if (!user)
        return;

      const snapshot =
        await getDocs(
          collection(
            db,
            "submitted_testimonies"
          )
        );

      const exists =
        snapshot.docs.some(
          (doc) => {

            const data =
              doc.data();

            return (
              data.uid ===
                user.uid &&
              data.date ===
                selectedDate
            );

          }
        );

      setTestimonySubmitted(
        exists
      );

    };

  checkSubmitted();

}, [
  user,
  selectedDate,
]);

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
      
      const savedReflection = localStorage.getItem(
         `reflection-${user?.uid}-${selectedDate}` 
        ); setReflection( savedReflection || data.reflection || "" );

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

const copyForLine = async () => {

  const actionText =
    actions
      .filter(
        (action) => action.text
      )
      .map(
        (action) =>
          `・${action.text}${
            action.checked
              ? " ✅"
              : ""
          }`
      )
      .join("\n");

  const text = `
【今日の記録】

■ 今日の目標
${goal}

■ 勝利
${victory}

■ 敗北
${defeat}

■ 証
${testimony}

■ 振り返り
${reflection}

■ 実践項目
${actionText}

■ タグ
${selectedTags.join("、")}
`;

  await navigator.clipboard.writeText(
    text
  );

  alert(
    "LINE用の内容をコピーしました"
  );

};

const defaultTags = [
  "重要",
  "証",
  "祈り",
  "人間関係",
  "感謝",
  "葛藤",
];

const tags = defaultTags;


const [customTag, setCustomTag] =
  useState("");

const [customTags, setCustomTags] =
  useState<string[]>([]);
  

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

       <h1 className="text-xl font-light tracking-wide">
        今日の振り返り
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

 <div className="mb-2 flex items-center justify-between text-sm text-gray-400">

  <div className="flex items-center gap-4">

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

  <button
    onClick={copyForLine}
    className={`rounded-full px-3 py-1 ${
      darkMode
        ? "hover:bg-gray-700"
        : "hover:bg-gray-100"
    }`}
  >
    📋LINE
  </button>

</div>

{showCalendar && (
  <div className="mb-4">
    <Calendar
      onChange={(value) => {
        const date =
          new Date(value as Date)
            .toLocaleDateString("sv-SE");

        setSelectedDate(date);
        setShowCalendar(false);
      }}
      value={new Date(selectedDate)}
      tileContent={({ date, view }) => {
        if (view !== "month") return null;

        const dateString =
          date.toLocaleDateString("sv-SE");

        return recordedDateSet.has(dateString) ? (
          <div className="text-center text-green-500 text-xs">
            ●
          </div>
        ) : null;
      }}
    />
  </div>
)}

</section>

     

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

  <div className="flex items-center justify-between">

    <h3 className="text-lg font-medium">
      神様との出会い・証
    </h3>

    <button
  onClick={submitTestimony}
  disabled={testimonySubmitted}
  className={`rounded-xl px-3 py-2 text-sm transition-colors ${
    testimonySubmitted
      ? darkMode
        ? "bg-green-800 text-green-100"
        : "bg-green-100 text-green-700"
      : darkMode
      ? "bg-yellow-800 text-yellow-100 hover:bg-yellow-700"
      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  }`}
>
  {testimonySubmitted
    ? "✅ 提出済み"
    : "📤 提出"}
</button>

  </div>

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
     
       {[
  ...tags,
  ...customTags,
].map((tag) => (

   <div
    key={tag}
    className="flex items-center gap-1"
  >

         <button
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

{!defaultTags.includes(tag) && (

  <button
    onClick={async () => {

      const updatedCustomTags =
        customTags.filter(
          (t) => t !== tag
        );

      setCustomTags(
        updatedCustomTags
      );

      const updatedSelectedTags =
  selectedTags.filter(
    (t) => t !== tag
  );

setSelectedTags(
  updatedSelectedTags
);


      if (!user) return;

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "settings",
          "custom_tags"
        ),
        {
          tags:
            updatedCustomTags,
        }
      );

    }}
    className="text-xs text-red-500 px-1"
  >
    ✕
  </button>

)}

 </div>

        ))}
      </div>

     <input
  value={customTag}
  onChange={(e) =>
    setCustomTag(
      e.target.value
    )
  }
  className={`w-full rounded-2xl p-4 shadow-sm outline-none placeholder:text-gray-400 ${
    darkMode
      ? "bg-gray-800/80 text-white"
      : "bg-gray-50 text-gray-800"
  }`}
  placeholder="自由タグを追加"
/>

<div className="mt-2 flex justify-end">

  <button
    onClick={async () => {

      if (
        !customTag.trim()
      )
        return;

      if (
        customTags.includes(
          customTag
        )
      )
        return;

      const updatedCustomTags = [
        ...customTags,
        customTag,
      ];

      setCustomTags(
        updatedCustomTags
      );

      if (!user) return;

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "settings",
          "custom_tags"
        ),
        {
          tags:
            updatedCustomTags,
        }
      );

      setCustomTag("");

    }}
 className={`rounded-xl px-4 py-2 transition-colors ${
  darkMode
    ? "bg-sky-800 text-sky-100 hover:bg-sky-700"
    : "bg-sky-200 text-sky-800 hover:bg-sky-300"
}`}
  >
    タグ追加
  </button>

</div>

    </section>

 
<section className="space-y-4">

  <h3 className="text-lg font-medium">
    過去の記録
  </h3>

  <p
    className={`text-sm ${
      darkMode
        ? "text-gray-400"
        : "text-gray-500"
    }`}
  >
    タグで絞り込んで過去の歩みを振り返る
  </p>

  <div className="flex flex-wrap gap-2">
   {[
  ...tags,
  ...customTags,
].map((tag) => (
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

    {filterTag && (

  <p
    className={`mb-3 text-sm ${
      darkMode
        ? "text-gray-400"
        : "text-gray-500"
    }`}
  >
    🏷️ {filterTag}
    ：
    {
      logs.filter((log) =>
        log.tags?.includes(
          filterTag
        )
      ).length
    }件
  </p>

)}

  </div>

  <div className="space-y-2">
    {logs
      .filter((log) => {
        if (!filterTag) return true;

        return log.tags?.includes(
          filterTag
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(
  0,
  filterTag
    ? logs.length
    : 7
)
      .map((log) => (
        <div
          key={log.id}
         onClick={async () => {

  setSelectedDate(log.id);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

}}
          className={`cursor-pointer rounded-2xl p-4 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5 ${
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
