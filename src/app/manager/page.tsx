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

    <main className="mx-auto max-w-md p-6">

      <h1 className="mb-8 text-center text-2xl font-bold">
        管理者ログイン
      </h1>

      <input
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
        placeholder="パスワード"
        className="w-full rounded-2xl border p-4"
      />

      <button
        onClick={login}
        className="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-white"
      >
        ログイン
      </button>

    </main>

  );

}