"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

type Props = {
  params: Promise<{
    route: string;
  }>;
};

export default function ReflectionPage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);

  const [slogan, setSlogan] = useState("");
  const [victory, setVictory] = useState("");
  const [defeat, setDefeat] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [changes, setChanges] = useState("");
  const [nextSlogan, setNextSlogan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [, month] = currentMonth.split("-");

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

  // 保存済みデータを読み込む
  useEffect(() => {
    if (!user) return;

    const fetchReflection = async () => {
      try {
        const docSnap = await getDoc(
          doc(
            db,
            "users",
            user.uid,
            "team_reports",
            currentMonth,
            "routes",
            `route_${route}`
          )
        );

        if (docSnap.exists()) {
          const data = docSnap.data();

          setSlogan(data.slogan || "");
          setVictory(data.victory || "");
          setDefeat(data.defeat || "");
          setCurrentState(data.currentState || "");
          setChanges(data.changes || "");
          setNextSlogan(data.nextSlogan || "");
        }
      } catch (error) {
        console.error(
          "振り返りの読み込みエラー",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReflection();
  }, [user, currentMonth, route]);

  // 保存
  const saveReflection = async () => {
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
          currentMonth,
          "routes",
          `route_${route}`
        ),
        {
          slogan,
          victory,
          defeat,
          currentState,
          changes,
          nextSlogan,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      alert("振り返りを保存しました");
    } catch (error) {
      console.error(
        "振り返りの保存エラー",
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
        href={`/team-reports/routes/${route}`}
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
        ① 前路程の振り返り
      </p>

      <div className="space-y-6">
        {/* 班スローガン */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            班スローガン
          </p>

          <textarea
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="今路程の班スローガンを入力してください"
            className={`min-h-28 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 勝利点 */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            班としての勝利点
          </p>

          <textarea
            value={victory}
            onChange={(e) => setVictory(e.target.value)}
            placeholder="班としての取り組みの勝利点を入力してください"
            className={`min-h-40 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 敗北点 */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            班としての敗北点
          </p>

          <textarea
            value={defeat}
            onChange={(e) => setDefeat(e.target.value)}
            placeholder="班としての取り組みの敗北点を入力してください"
            className={`min-h-40 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 現状 */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            班としての具体的な取り組み・現状
          </p>

          <textarea
            value={currentState}
            onChange={(e) =>
              setCurrentState(e.target.value)
            }
            placeholder="現在の班の状況や具体的な取り組みを入力してください"
            className={`min-h-40 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 変更・追加 */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            変更・追加した具体的な取り組み
          </p>

          <textarea
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
            placeholder="変更したこと、追加した取り組みを入力してください"
            className={`min-h-40 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 次路程の班スローガン */}
        <section
          className={`rounded-3xl p-6 shadow-sm transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/80"
              : "bg-gray-50"
          }`}
        >
          <p className="mb-3 text-sm text-gray-400">
            次路程の班スローガン
          </p>

          <textarea
            value={nextSlogan}
            onChange={(e) =>
              setNextSlogan(e.target.value)
            }
            placeholder="次路程の班スローガンを入力してください"
            className={`min-h-28 w-full resize-none rounded-2xl border p-4 outline-none transition ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        </section>

        {/* 保存 */}
        <button
          type="button"
          onClick={saveReflection}
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