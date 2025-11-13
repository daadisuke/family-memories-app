"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FamilyMember {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  created_at: string;
}

interface Family {
  id: string;
  name: string;
  createdAt: string;
  members: FamilyMember[];
}

interface FamilyInvitation {
  id: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
}

export default function FamilyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 招待機能のstate
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    fetchFamily();
    if (isAdmin) {
      fetchInvitations();
    }
  }, [status, router, isAdmin]);

  const fetchFamily = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/families");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "家族情報の取得に失敗しました");
      }

      setFamily(data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!isAdmin) {
      alert("管理者権限が必要です");
      return;
    }

    if (userId === session?.user?.id) {
      alert("自分自身を削除することはできません");
      return;
    }

    const confirmed = confirm(
      `${memberName || "このメンバー"}を家族グループから削除しますか？`
    );
    if (!confirmed) return;

    try {
      setActionLoading(userId);
      const response = await fetch("/api/families/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "メンバーの削除に失敗しました");
      }

      // Refresh family data
      await fetchFamily();
      alert("メンバーを削除しました");
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      alert("管理者権限が必要です");
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch("/api/families/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "役割の更新に失敗しました");
      }

      // Refresh family data
      await fetchFamily();
      alert("役割を更新しました");
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/families/invitations");
      const data = await response.json();

      if (response.ok) {
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("管理者権限が必要です");
      return;
    }

    if (!inviteEmail.trim()) {
      alert("メールアドレスを入力してください");
      return;
    }

    try {
      setInviteLoading(true);
      const response = await fetch("/api/families/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "招待の作成に失敗しました");
      }

      alert("招待を作成しました");
      setInviteEmail("");
      await fetchInvitations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  const handleDeleteInvitation = async (invitationId: string, email: string) => {
    if (!isAdmin) {
      alert("管理者権限が必要です");
      return;
    }

    const confirmed = confirm(`${email}への招待を取り消しますか？`);
    if (!confirmed) return;

    try {
      setActionLoading(invitationId);
      const response = await fetch("/api/families/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "招待の削除に失敗しました");
      }

      alert("招待を削除しました");
      await fetchInvitations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchFamily}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">家族グループが見つかりません</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            家族グループを作成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{family.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            作成日: {new Date(family.createdAt).toLocaleDateString("ja-JP")}
          </p>
          {isAdmin && (
            <p className="mt-1 text-sm text-blue-600">
              あなたは管理者です
            </p>
          )}
        </div>

        {/* Members List */}
        <div className="rounded-lg bg-white shadow-md overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              メンバー一覧 ({family.members.length}人)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Member Avatar */}
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name || member.email}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold">
                          {(member.name || member.email)[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Member Info */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name || "名前未設定"}
                        {member.id === session?.user?.id && (
                          <span className="ml-2 text-sm text-gray-500">
                            (あなた)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        参加日:{" "}
                        {new Date(member.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>

                  {/* Role and Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Role Selector */}
                    {isAdmin && member.id !== session?.user?.id ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateRole(member.id, e.target.value)
                        }
                        disabled={actionLoading === member.id}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="member">メンバー</option>
                        <option value="admin">管理者</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          member.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role === "admin" ? "管理者" : "メンバー"}
                      </span>
                    )}

                    {/* Remove Button */}
                    {isAdmin && member.id !== session?.user?.id && (
                      <button
                        onClick={() =>
                          handleRemoveMember(member.id, member.name || member.email)
                        }
                        disabled={actionLoading === member.id}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === member.id ? "処理中..." : "削除"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Section */}
        {isAdmin && (
          <div className="mt-8 rounded-lg bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              メンバーを招待
            </h2>
            <form onSubmit={handleSendInvite} className="mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="メールアドレス"
                  disabled={inviteLoading}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteLoading ? "送信中..." : "招待を送信"}
                </button>
              </div>
            </form>

            {/* Pending Invitations List */}
            {invitations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  送信済み招待 ({invitations.filter(inv => inv.status === "pending").length}件)
                </h3>
                <div className="space-y-3">
                  {invitations
                    .filter((inv) => inv.status === "pending")
                    .map((invitation) => {
                      const isExpired = new Date() > new Date(invitation.expires_at);
                      return (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {invitation.email}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {isExpired ? (
                                <span className="text-red-600">
                                  期限切れ ({new Date(invitation.expires_at).toLocaleDateString("ja-JP")})
                                </span>
                              ) : (
                                <span>
                                  有効期限: {new Date(invitation.expires_at).toLocaleDateString("ja-JP")}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyInviteLink(invitation.token)}
                              disabled={isExpired}
                              className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {copiedToken === invitation.token ? "✓ コピー済み" : "リンクをコピー"}
                            </button>
                            <button
                              onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                              disabled={actionLoading === invitation.id}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === invitation.id ? "処理中..." : "削除"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
