"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [user, setUser] = useState<any>(null);

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

useEffect(() => {
  if (!user) return;

  const fetchProfile = async () => {
    const docRef = doc(
      db,
      "users",
      user.uid
    );

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      setName(data.name || "");
      setTeam(data.team || "");
    }
  };

  fetchProfile();
}, [user]);

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
    <Link
  href="/"
  className="mb-4 inline-block text-sm text-gray-400"
>
  ← ホームへ戻る
</Link>
 
      <h1 className="mb-8 text-3xl font-light">
        プロフィール
      </h1>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm">
            氏名
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-2xl border p-4"
            placeholder="氏名を入力"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">
            班
          </label>

          <input
            value={team}
            onChange={(e) =>
              setTeam(e.target.value)
            }
            className="w-full rounded-2xl border p-4"
            placeholder="班を入力"
          />
        </div>

<button
 onClick={async () => {
  console.log("クリック");
  console.log("user", user);

  if (!user) {
    alert("userがいません");
    return;
  }

  try {
    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {
        name,
        team,
        role: "member",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    alert("保存しました");
  } catch (error) {
    console.log("保存エラー", error);
    alert("保存失敗");
  }
}}
  className="w-full cursor-pointer rounded-2xl bg-gray-800 py-4 text-white"
>
  保存
</button>

      </div>
    </main>
  );
}