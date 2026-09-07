"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type Props = {
  params: Promise<{
    route: string;
  }>;
};

export default function RoutePage({ params }: Props) {
  const { route } = use(params);

  const [user, setUser] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [, month] = currentMonth.split("-");

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

  const formatDate = (date: string) => {
    if (!date) return "";

    const [, m, d] = date.split("-");

    return `${Number(m)}月${Number(d)}日`;
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/team-reports"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 週間班長レポートへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        {Number(month)}月 第{route}次路程
      </h1>

      <p className="mb-3 text-sm text-gray-400">
        {loading
          ? "期間を読み込み中..."
          : startDate && endDate
          ? `期間：${formatDate(startDate)}〜${formatDate(endDate)}`
          : "期間：未設定"}
      </p>

      <Link
        href={`/team-reports/routes/${route}/settings`}
        className="mb-10 inline-block text-xs text-green-600"
      >
        期間を設定 →
      </Link>

      <div className="space-y-4">
        <Link
          href={`/team-reports/routes/${route}/reflection`}
          className="block"
        >
          <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
            <p className="text-sm text-gray-400">
              ① 前路程の振り返り
            </p>

            <p className="mt-3 text-lg leading-8">
              班としての歩みを振り返る
            </p>

            <p className="mt-4 text-xs text-green-600">
              記入する →
            </p>
          </div>
        </Link>

        <Link
          href={`/team-reports/routes/${route}/results`}
          className="block"
        >
          <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
            <p className="text-sm text-gray-400">
              ② 班員ごとの結果
            </p>

            <p className="mt-3 text-lg leading-8">
              班員一人ひとりの結果を記録する
            </p>

            <p className="mt-4 text-xs text-green-600">
              記入する →
            </p>
          </div>
        </Link>

        <Link
          href={`/team-reports/routes/${route}/goals`}
          className="block"
        >
          <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
            <p className="text-sm text-gray-400">
              ③ 次路程の個人目標
            </p>

            <p className="mt-3 text-lg leading-8">
              次の路程に向けた目標を記録する
            </p>

            <p className="mt-4 text-xs text-green-600">
              記入する →
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}