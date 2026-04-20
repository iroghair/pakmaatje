"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { Check, X, Shield, User as UserIcon } from "lucide-react";

export function AdminClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  const handleUpdate = async (userId: string, data: { status?: string; role?: string }) => {
    // Optimistic UI
    setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));

    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="p-4 text-sm font-semibold text-zinc-400">User</th>
            <th className="p-4 text-sm font-semibold text-zinc-400">Email</th>
            <th className="p-4 text-sm font-semibold text-zinc-400">Status</th>
            <th className="p-4 text-sm font-semibold text-zinc-400">Role</th>
            <th className="p-4 text-sm font-semibold text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
              <td className="p-4">
                <div className="font-medium text-zinc-200">{user.name || "Unknown"}</div>
              </td>
              <td className="p-4 text-zinc-400 text-sm">{user.email}</td>
              <td className="p-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                  user.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  {user.role === 'ADMIN' ? <Shield className="w-4 h-4 text-indigo-400" /> : <UserIcon className="w-4 h-4" />}
                  {user.role}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {user.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleUpdate(user.id, { status: "APPROVED" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdate(user.id, { status: "PENDING" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      <X className="w-3 h-3" /> Revoke
                    </button>
                  )}
                  {user.role === 'USER' && (
                    <button 
                      onClick={() => handleUpdate(user.id, { role: "ADMIN" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
