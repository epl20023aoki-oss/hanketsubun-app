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

export default function RouteSettingsPage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchRouteSettings = async () => {
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

          setStartDate(data.startDate || "");
          setEndDate(data.endDate || "");
        }
      } catch (error) {
        console.error("路程設定の読み込みエラー", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteSettings();
  }, [user, currentMonth, route]);

  const saveRouteSettings = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    if (!startDate || !endDate) {
      alert("開始日と終了日を入力してください");
      return;
    }

    if (startDate > endDate) {
      alert("終了日は開始日より後の日付にしてください");
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
          startDate,
          endDate,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      alert(`第${route}次路程の期間を保存しました`);
    } catch (error) {
      console.error("路程設定の保存エラー", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-gray-400">
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/team-reports/routes/${route}`}
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 第{route}次路程へ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        第{route}次路程の設定
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        路程の期間を設定しましょう
      </p>

      <section className="rounded-3xl bg-gray-50 p-6 shadow-sm">
        <p className="mb-6 text-sm text-gray-400">
          路程期間
        </p>

        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm text-gray-500">
              開始日
            </p>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            />
          </div>

          <div>
            <p className="mb-3 text-sm text-gray-500">
              終了日
            </p>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={saveRouteSettings}
            disabled={saving}
            className="w-full rounded-2xl bg-gray-800 py-4 text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </section>
    </main>
  );
}