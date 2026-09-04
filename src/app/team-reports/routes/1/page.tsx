"use client";

import Link from "next/link";

export default function Route1Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/team-reports"
        className="mb-6 inline-block text-sm text-gray-400"
      >
        ← 週間班長レポートへ戻る
      </Link>

      <h1 className="mb-2 text-3xl font-light tracking-wide">
        9月 第1次路程
      </h1>

      <p className="mb-10 text-sm text-gray-400">
        期間：未設定
      </p>

      <div className="space-y-4">
        {/* ① */}
        <Link
          href="/team-reports/routes/1/reflection"
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

        {/* ② */}
        <Link
          href="/team-reports/routes/1/results"
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

        {/* ③ */}
        <Link
          href="/team-reports/routes/1/goals"
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