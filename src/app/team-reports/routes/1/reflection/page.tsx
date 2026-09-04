"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";

export default function ReflectionPage() {
  const [user, setUser] = useState<any>(null);

  const [slogan, setSlogan] = useState("");
  const [victory, setVictory] = useState("");
  const [defeat, setDefeat] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [changes, setChanges] = useState("");
  const [nextSlogan, setNextSlogan] = useState("");

  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

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

  // 保存済みの内容を読み込む
  useEffect(() => {
    if (!user) return;

    const fetchReflection = async () => {
      const docRef = doc(
        db,
        "users",
        user.uid,
        "team_reports",
        currentMonth,
        "routes",
        "route_1"
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setSlogan(data.slogan || "");
        setVictory(data.victory || "");
        setDefeat(data.defeat || "");
        setCurrentState(data.currentState || "");
        setChanges(data.changes || "");
        setNextSlogan(data.nextSlogan || "");
      }
    };

    fetchReflection();
  }, [user, currentMonth]);

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
          "route_1"
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

      alert("保存しました");
    } catch (error) {
      console.error(
        "前路程の振り返り保存エラー",
        error
      );

      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/team-reports/routes/1"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 第1次路程へ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        ① 前路程の振り返り
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        班としての歩みを振り返りましょう
      </p>

      <div className="space-y-8">

        {/* 班スローガン */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            班スローガン
          </p>

          <input
            value={slogan}
            onChange={(e) =>
              setSlogan(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="班スローガンを入力"
          />
        </section>

        {/* 勝利点 */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            勝利点
          </p>

          <textarea
            value={victory}
            onChange={(e) =>
              setVictory(e.target.value)
            }
            className="min-h-[160px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="班としての勝利点を記入してください"
          />
        </section>

        {/* 敗北点 */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            敗北点
          </p>

          <textarea
            value={defeat}
            onChange={(e) =>
              setDefeat(e.target.value)
            }
            className="min-h-[160px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="班としての敗北点を記入してください"
          />
        </section>

        {/* 班としての具体的な取り組み・現状 */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            班としての具体的な取り組み・現状
          </p>

          <textarea
            value={currentState}
            onChange={(e) =>
              setCurrentState(e.target.value)
            }
            className="min-h-[160px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="現在の班の取り組みや状況を記入してください"
          />
        </section>

        {/* 変更・追加 */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            変更・追加
          </p>

          <textarea
            value={changes}
            onChange={(e) =>
              setChanges(e.target.value)
            }
            className="min-h-[160px] w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="今後変更・追加する取り組みを記入してください"
          />
        </section>

        {/* 次路程の班スローガン */}
        <section>
          <p className="mb-3 text-sm text-gray-400">
            次路程の班スローガン
          </p>

          <input
            value={nextSlogan}
            onChange={(e) =>
              setNextSlogan(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            placeholder="次路程の班スローガンを入力"
          />
        </section>

        {/* 保存 */}
        <button
          type="button"
          onClick={saveReflection}
          disabled={saving}
          className="w-full rounded-2xl bg-gray-800 py-4 text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>

      </div>
    </main>
  );
}