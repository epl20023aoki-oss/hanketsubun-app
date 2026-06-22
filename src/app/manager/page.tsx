"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerLoginPage() {

  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const login = () => {

    if (
      password ===
      "pantastaff-19450823"
    ) {

      localStorage.setItem(
        "staffAuth",
        "true"
      );

      router.push("/admin");

    } else {

      alert(
        "パスワードが違います"
      );

    }

  };

  return (

    <main className="flex min-h-screen items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-8 text-center">

          <div className="mb-3 text-5xl">
            🍃
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            あしあと
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            月末レポート管理画面
          </p>

        </div>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          placeholder="パスワード"
          className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-green-500"
        />

        <button
          onClick={login}
          className="mt-4 w-full rounded-2xl bg-green-600 py-4 text-white transition hover:bg-green-700"
        >
          ログイン
        </button>

      </div>

    </main>

  );

}