import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect to onboarding if user has no family
  if (session?.user && !session.user.familyId) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Family Memories
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          家族の思い出を保存・共有するアプリ
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/photos"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            写真を見る
          </a>
          <a
            href="/upload"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            写真をアップロード <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
