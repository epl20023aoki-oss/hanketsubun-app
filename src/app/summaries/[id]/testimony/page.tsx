"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../../lib/firebase";

export default function TestimonyPage() {

  const params = useParams();

  const summaryId =
    params.id as string;

  const [userId, setUserId] =
    useState("");

  const [testimony, setTestimony] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const loadedRef =
    useRef(false);

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

  }, []);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          if (!currentUser) {
            setLoading(false);
            return;
          }

          setUserId(
            currentUser.uid
          );

          const summarySnap =
            await getDoc(
              doc(
                db,
                "users",
                currentUser.uid,
                "summaries",
                summaryId
              )
            );

          if (summarySnap.exists()) {

            const data =
              summarySnap.data();

            setTestimony(
              data.testimony || ""
            );

          }

          loadedRef.current = true;

          setLoading(false);

        }
      );

    return () => unsubscribe();

  }, [summaryId]);

  useEffect(() => {

    if (!loadedRef.current) return;

    if (!userId) return;

    setSaving(true);

    const timer =
      setTimeout(
        async () => {

          try {

            await updateDoc(
              doc(
                db,
                "users",
                userId,
                "summaries",
                summaryId
              ),
              {
                testimony,
                updatedAt:
                  serverTimestamp(),
              }
            );

          } catch (error) {

            console.error(
              "証しの保存に失敗しました",
              error
            );

          } finally {

            setSaving(false);

          }

        },
        800
      );

    return () =>
      clearTimeout(timer);

  }, [
    testimony,
    userId,
    summaryId,
  ]);

  if (loading) {

    return (
      <main
        className={`min-h-screen px-4 py-6 ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-xl">
          読み込み中...
        </div>
      </main>
    );

  }

  return (
    <main
      className={`min-h-screen px-4 py-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-xl">

        <div className="flex items-center justify-between">

          <Link
            href={`/summaries/${summaryId}`}
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            ← 総括へ戻る
          </Link>

          <span
            className={`text-xs ${
              saving
                ? "text-green-500"
                : darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            {saving
              ? "☁ 保存中..."
              : "✓ 保存済み"}
          </span>

        </div>

        <div className="mt-8">

          <p className="text-sm text-green-600">
            🌱 総括
          </p>

          <h1 className="mt-2 text-2xl font-light">
            ③ 証し
          </h1>

          <p
            className={`mt-3 text-sm leading-6 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            神体験・復帰したみ言や心情などを、
            具体的に記入してください。
          </p>

        </div>

        <textarea
          value={testimony}
          onChange={(e) =>
            setTestimony(
              e.target.value
            )
          }
          placeholder="ここに証しを記入してください"
          className={`mt-8 min-h-[60vh] w-full resize-none rounded-3xl border p-5 leading-8 outline-none transition-all ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-green-700"
              : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-green-400"
          }`}
        />

      </div>
    </main>
  );
}
