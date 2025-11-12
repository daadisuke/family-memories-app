"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if user already has a family
    if (session?.user?.familyId) {
      router.push("/");
    }
  }, [session, router]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: familyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "家族グループの作成に失敗しました");
      }

      // Update session with new family ID
      await update();

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            ようこそ、{session.user.name}さん
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            まずは家族グループを作成しましょう
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCreateFamily}>
          <div>
            <label
              htmlFor="family-name"
              className="block text-sm font-medium text-gray-700"
            >
              家族グループ名
            </label>
            <div className="mt-1">
              <input
                id="family-name"
                name="family-name"
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="例: 山田家"
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              家族の写真を共有するグループの名前を入力してください
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">エラー</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !familyName.trim()}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "作成中..." : "家族グループを作成"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">または</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              招待リンクをお持ちの方は、
              <br />
              そちらから家族グループに参加できます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
