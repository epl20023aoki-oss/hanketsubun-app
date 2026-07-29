"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  collection,
  getDocs,
  getDoc,
  setDoc, 
  doc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "./lib/firebase";


import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
} from "firebase/auth";


const dailyWords = [
"大きい事を目標にすればするほど　大きい忍耐が必要なのです。",
"同一なる実力をもっても勝つ秘訣は　他よりたくさん動くことである。",
"試練と苦労は私の恩讐ではなく　輝かしい価値を　決定してくれる材料である。",
"勝利の秘訣は勝つまでやることです。投入すれば必ず最後、どこかで結果が現れます。",
"信仰の道は結果ではない。どれだけ時間と誠心誠意を尽くすかが大切なんだよ。",
"我々は神の為の闘いをしよう、絶対に滅びない。イスラエル民族が荒野で倒れたのは、勝利しなければならないという信念がなかったためである。", 
"皆さんが決して躓かない事を保証できるひとつの確かな道は悔い改めの道、日々悔い改める人は、たとえその事を悟っていなくても成長しているのです。", 
"愛を受けなかった事を恨みとせずに、愛を授けられなかったことを恨みとしなければならない。", 
"勝敗は十年後に決定されるのではなく、今のこの時点において決定する。この現在の時点を乗り越えることが出来ない人は、勝利者となることができないであろう。", 
"ニコニコ笑いなさい、ニコニコ笑ってね、心配顔では神は働きません、毎日鏡を見て「私は神に愛されている」「神は私と共にいる」と言いなさい、そうしないと心配の霊界が寄って来て、信仰の火が消える。", 
"全ての困難を自分で受けていると思うな神と共に受けていると思いなさい。", 
"神の立場を考えて見た場合、いかに可哀想な神であろうか我々、いかに苦労すると言っても一生以外にはない地上生活は一世紀以内の生涯である。", 
"完全投入せずして完全な結果を願うところにおいて失敗が生じてくる。", 
"罪がなくて勝利するのが簡単だった者より罪が多くて勝利するのが困難だった者が勝利してくれる方が、私にとってどれ程大きな希望となることだろうか。", 
"賢い者はひとたび歩み始めた道を全うします、勝利は耐え忍んで最後まで全行程を走り抜く者の上にのみあります。", 
"士気を失うな、自信がない所に前進があるはずがない。みずから士気を呼び起こして事を成していきなさい、神は意欲がない所には協助なさらない。", 
"祈りの時は謙遜になれるというんだよ祈祷とは何か、一人で考えるんじゃないよ、神様と共に考える、神様と共に相談しよう、こういう立場が絶対必要だというんだね。", 
"先生は監獄で拷問を受ける時も、神がこのような道に送ってくださる時行けという神より、行かせねばならない事情を持っていた神を先に考えた", 
"あなた達は「もうできない」というできるかできないかは死ぬまでやってみてから結論すべきことだよ不平を言うのは、神を責めることだ。", 
"雨が降って疲れてその仕事を自分がしたくない時に、その仕事を自分のためにではなく天のために人類のためにしたのでより価値のあることになるということを皆さんは知らなければなりません。", 
"出来ないというな。できなかったら無理にでもやってみなさい、必ず道がある見つけ出しなさい。", 
"無条件に天の前に捧げ意のままに任せる心が必要である、神様は私の父であるので私がいなければならない所をよく知って、私が幸福になり満足を感じ得る場所に私を導かれる。",
"笑顔で気分のよい姿はみな見つめます気分の悪い表情をするのは悪です。これが恐ろしい戦法なのです。これが善悪の分岐点です。", 
"堕落の道を乗り越えるには絶対服従の道以外にない、絶対服従しながらも希望に満ちて喜んで行かなければならない。それは再創造の道だから！", 
"サタンは、愛を生命視できても犠牲の愛を行う事は出来ないのです。天使長は自己中心の愛からはじまり犠牲的愛、為に尽くす愛をなしえなかったため堕落したのです。", 
"苦労した結果がすぐ出ないといって落胆するな、外的に戻ってくるまでどれくらい精誠を尽くしたかが問題である。", 
"神の試練は何故あるか？悪を断ち切り私の心を一つにさせる為、私の心情を神の心情と一つになるようにする為、神の過去の日々を正しく体恤させる為、故に喜んで感謝せよ、神が私を愛してくださっている証拠である。", 
"後退することも前進することも自分自身が母体である。後退する人は人も嫌うが神も嫌うのである。", 
"時の転換点における勝負は時間と努力が問題である。そしてこれを動かしていくためには勇気が必要である。", 
"罪があるからと言って嘆くな自分が及ばざると言って嘆息するな、及ばざる者でも投入し犠牲の道を辿ったら、満ちて勝利の花が咲く。", 
"だから励んでほしい、あとわずかの後に迎えるその日まで、つらくても辛抱して後退せず歩んで勝利の旗を掲げて神に凱旋歌を挙げるのが我々の使命であります。", 
]; 

export default function Home() {

  const [logs, setLogs] =
  useState<any[]>([]);

  const [saving, setSaving] =
  useState(false);

const [user, setUser] =
  useState<any>(null);
  
const [name, setName] = useState("");
const [team, setTeam] = useState("");

const [role, setRole] =
  useState("");

const [latestGoal, setLatestGoal] =
  useState<any>(null);

  const reflectionRef =
  useRef<HTMLTextAreaElement>(null);

const [darkMode, setDarkMode] =
  useState(false);

const [mounted, setMounted] =
  useState(false);

  const [reflection, setReflection] =
  useState("");

  const todayKey =
  new Date().toISOString().split("T")[0];
  
  const today =
  new Date().getDate();

const todaysWord =
  dailyWords[today - 1];
const currentMonth =
  new Date().toISOString().slice(0, 7);

const monthlyLogs = logs.filter(
  (log) =>
    log.date?.startsWith(currentMonth)
);

const allActions =
  monthlyLogs.flatMap(
    (log) => log.actions || []
  );

const completedActions =
  allActions.filter(
    (action) => action.checked
  );

const achievementRate =
  allActions.length > 0
    ? Math.round(
        (completedActions.length /
          allActions.length) *
          100
      )
    : 0;

    let achievementMessage = "";

if (achievementRate >= 80) {
  achievementMessage =
    "よく歩めています";
} else if (achievementRate >= 50) {
  achievementMessage =
    "一歩ずつ進んでいます";
} else if (achievementRate >= 20) {
  achievementMessage =
    "小さな歩みを積み重ねています";
} else {
  achievementMessage =
    "今日も新しい一歩から";
}

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

useEffect(() => {
   const unsubscribe = 
   onAuthStateChanged( 
    auth, 
    (currentUser) => {
      
      setUser(currentUser);
      
      if (!currentUser) { setReflection("");

       }
      } 
    ); return () => unsubscribe();
  
  }, []);


 useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(auth, async (currentUser) => {

      setUser(currentUser);

      if (!currentUser) return;

      const querySnapshot =
        await getDocs(
          collection(
            db,
            "users",
            currentUser.uid,
            "daily_logs"
          )
        );

      const logsData =
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setLogs(logsData);
    });

  return () => unsubscribe();

}, []);

useEffect(() => {
  if (!user) return;

  const fetchProfile = async () => {
    const docSnap = await getDoc(
      doc(
        db,
        "users",
        user.uid
      )
    );

    if (docSnap.exists()) {
      const data = docSnap.data();

      setName(data.name || "");
      setTeam(data.team || "");
      setRole(
        data.role || "member"
     );
    }
  };

  fetchProfile();
}, [user]);

useEffect(() => {
  if (!user) return;

  const fetchLatestGoal = async () => {

    const snapshot = await getDocs(
      collection(
        db,
        "users",
        user.uid,
        "monthly_goals"
      )
    );

    const goals = snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    goals.sort((a: any, b: any) =>
      b.id.localeCompare(a.id)
    );

    setLatestGoal(
      goals.length > 0
        ? goals[0]
        : null
    );
  };

  fetchLatestGoal();

}, [user]);


useEffect(() => {
  localStorage.setItem(
    "darkMode",
    String(darkMode)
  );
}, [darkMode]);

useEffect(() => {

  if (!user?.uid) return;

  const fetchReflection =
    async () => {

      const docRef = doc(
        db,
        "users",
        user.uid,
        "daily_logs",
        todayKey
      );

      const docSnap =
        await getDoc(docRef);

      if (docSnap.exists()) {

        const data =
          docSnap.data();

        setReflection(
          data.reflection || ""
        );
      }
    };

  fetchReflection();

}, [user]);



useEffect(() => {

  const textarea =
    reflectionRef.current;

  if (!textarea) return;

  textarea.style.height =
    "auto";

  textarea.style.height =
    textarea.scrollHeight + "px";

}, [reflection]);

useEffect(() => {

  if (!user?.uid) return;

  if (!reflection) return;

  const saveReflection =
    async () => {

      setSaving(true);

      console.log(
        `reflection-${user?.uid}-${todayKey}`
      );

      localStorage.setItem(
        `reflection-${user.uid}-${todayKey}`,
        reflection
      );

      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "daily_logs",
          todayKey
        ),
        {
          reflection,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setTimeout(() => {
        setSaving(false);
      }, 500);
    };

  saveReflection();

}, [reflection, user]);

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

  setMounted(true);

}, []);

if (!mounted) {

  return null;

}

return (

   <main
  className={`mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10 transition-all duration-300 ${
    darkMode
      ? "bg-[#111827] text-white"
      : "bg-white text-gray-800"
  }`}
>

{/* 上部バー */}
<header
  className={`relative sticky top-0 z-10 overflow-hidden border-b backdrop-blur transition-all ${
    darkMode
      ? "border-gray-800 bg-gray-900/90"
      : "border-gray-200 bg-white/90"
  }`}
>
{!darkMode && (

  <img
    src="/images/seedling.png"
    alt=""
   className="
  pointer-events-none
  absolute
  right-4
  top-2
  h-24
  w-auto
  opacity-10
  blur-[1px]
  select-none
"
  />

)}

  <div className="flex items-center justify-between">

   <div className="relative">

 <div className="flex items-center gap-3">

  <img
    src="/images/seedling-logo.png"
    alt="あしあと"
    className="h-12 w-12 object-contain"
  />

  <div>

    <h1 className="text-3xl font-light tracking-wide">
      あしあと
    </h1>

    <p
      className={`text-xs ${
        darkMode
          ? "text-gray-400"
          : "text-gray-500"
      }`}
    >
      今日の歩みを次に繋げる
    </p>

  </div>

</div>

</div>

    <button
      onClick={() =>
        setDarkMode(!darkMode)
      }
      className="rounded-full bg-gray-200 px-3 py-1 text-xs"
    >
      {darkMode ? "☀️" : "🌙"}
    </button>

  </div>

  <div
    className={`mt-3 flex items-center justify-between text-xs ${
      darkMode
        ? "text-gray-200"
        : "text-gray-400"
    }`}
  >

    <span>
      {saving
        ? "☁ 保存中..."
        : "✓ 保存済み"}
    </span>

    <div className="flex items-center gap-3">

      <p
        className={`${
          darkMode
            ? "text-gray-200"
            : "text-gray-500"
        }`}
      >
        {user?.displayName}
      </p>

      {user ? (
        <button
          onClick={logout}
          className="rounded-full bg-red-500 px-3 py-1 text-white"
        >
          ログアウト
        </button>
      ) : (
        <button
          onClick={login}
          className={`rounded-full px-3 py-1 text-white ${
            darkMode
              ? "bg-white text-black"
              : "bg-[#111827]"
          }`}
        >
          Googleログイン
        </button>
      )}

    </div>

  </div>

</header>

       <section className="mt-10">
  <div
    className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
      darkMode
        ? "bg-gray-800/80"
        : "bg-gray-50"
    }`}
  >

    <p
      className={`text-sm ${
        darkMode
          ? "text-gray-300"
          : "text-gray-400"
      }`}
    >
      日めくりのみ言
    </p>

    <p className="mt-4 text-lg leading-8">
      {todaysWord}
    </p>

    <p
      className={`mt-4 text-right text-sm ${
        darkMode
          ? "text-gray-300"
          : "text-gray-400"
      }`}
    >
      - 今日のみ言 -
    </p>

    <div
      className={`mt-6 rounded-2xl p-4 transition-all duration-300 focus-within:ring-2 ${
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
  rows={1}
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

  </div>
</section>

      <section className="mt-6">
        

        <Link
  href="/journal"
  className={`block rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
    darkMode
      ? "bg-gray-800/80"
      : "bg-gray-50"
  }`}
>
         <p
  className={`text-sm ${
    darkMode
      ? "text-gray-300"
      : "text-gray-400"
  }`}
>

            今日の記録
          </p>

          <h2 className="mt-2 text-2xl">
            あしあとを書く
          </h2>
        </Link>

      </section>

      
{/* プロフィール */}
<section className="mt-6">
<Link href="/profile">
  <div
    className={`rounded-3xl p-6 shadow-sm transition-all duration-300 cursor-pointer ${
      darkMode
        ? "bg-gray-800/80"
        : "bg-gray-50"
    }`}
  >
    <p className="text-sm text-gray-400">
      プロフィール
    </p>

    <p className="mt-2 text-lg font-medium">
      {name || "プロフィール未設定"}
    </p>

    <p className="mt-1 text-sm text-gray-400">
      {team}
    </p>

    <p className="mt-4 text-xs text-gray-400">
      編集 →
    </p>
  </div>
</Link>
</section>

{role === "admin" && (

  <Link href="/admin">

    <section className="mt-6">

      <div
        className={`rounded-3xl p-6 shadow-sm transition-all duration-300 cursor-pointer ${
          darkMode
            ? "bg-gray-800/80"
            : "bg-gray-50"
        }`}
      >

        <p className="text-sm text-gray-400">
          管理画面
        </p>

        <p className="mt-2 text-lg">
          提出状況を確認
        </p>

        <p className="mt-4 text-xs text-gray-400">
          開く →
        </p>

      </div>

    </section>

  </Link>

)}

{/* 今月の目標 */}
<Link href="/monthly-goals">
  <section className="mt-6">
    <div
      className={`cursor-pointer rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/80"
          : "bg-gray-50"
      }`}
    >

    <p
      className={`text-sm ${
        darkMode
          ? "text-gray-300"
          : "text-gray-400"
      }`}
    >


      今月の目標
    </p>

   <div className="mt-4">

  {latestGoal ? (
    <>
      <p className="text-lg font-medium">
        {latestGoal.month
          ?.replace("-", "年")
          .concat("月")}
      </p>

      <p className="mt-4 text-sm text-gray-400">
        内的目標
      </p>

      <p className="mt-1 leading-8">
        {latestGoal.innerGoal}
      </p>

      <p className="mt-4 text-sm text-gray-400">
        外的目標
      </p>

      <p>
        {latestGoal.targetCount}件
      </p>

      <p>
        ¥
        {Number(
          latestGoal.targetAmount
        ).toLocaleString()}
      </p>
      <p className="mt-4 text-xs text-gray-400">
  編集 →
</p>
    </>
  ) : (
    <p className="leading-8 text-gray-400">
      月目標がまだありません
    </p>
  )}

</div>

  </div>
</section>
</Link>

<section className="mt-6">
  <div
   className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
  darkMode
    ? "bg-gray-800/80"
    : "bg-gray-50"
}`}
  >

    <p className="text-sm text-gray-400">
      今月の歩み
    </p>

   <p className="mt-4 text-4xl font-light">
  {achievementRate}%
</p>

<p className="mt-2 text-sm text-gray-400">
  アクションを達成しました
</p>

<p className="mt-4 text-sm leading-7 text-gray-400">
  {achievementMessage}
</p>

   
  </div>
</section>

<Link href="/monthly-reports">
  <section className="mt-6">
    <div
      className={`cursor-pointer rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/80"
          : "bg-gray-50"
      }`}
    >
      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-300"
            : "text-gray-400"
        }`}
      >
        反決文
      </p>

      <p className="mt-4 text-lg leading-8">
        今月の振り返りを作成
      </p>

      <p className="mt-4 text-xs text-gray-400">
        AIで下書きを生成 →
      </p>

    </div>
  </section>
</Link>

<Link href="/summaries">
  <section className="mt-6">
    <div
      className={`cursor-pointer rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/80"
          : "bg-gray-50"
      }`}
    >
      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-300"
            : "text-gray-400"
        }`}
      >
        総括
      </p>

      <p className="mt-4 text-lg leading-8">
        これまでの歩みを振り返る
      </p>

      <p
        className={`mt-4 text-xs ${
          darkMode
            ? "text-green-400"
            : "text-green-600"
        }`}
      >
        🌱 総括を作成・確認 →
      </p>

    </div>
  </section>
</Link>

<Link href="/monthly-reports/history">
  <section className="mt-6">
    <div
      className={`cursor-pointer rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/80"
          : "bg-gray-50"
      }`}
    >
      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-300"
            : "text-gray-400"
        }`}
      >
        履歴
      </p>

      <p className="mt-4 text-lg leading-8">
        月末レポート履歴
      </p>

      <p className="mt-4 text-xs text-gray-400">
        過去のレポートを見る →
      </p>

    </div>
  </section>
</Link>



    </main>
  );
}