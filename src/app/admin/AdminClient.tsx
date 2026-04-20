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
    <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/40 bg-white/30 backdrop-blur-md">
            <th className="p-4 text-sm font-extrabold text-primary-950 uppercase tracking-wide">User</th>
            <th className="p-4 text-sm font-extrabold text-primary-950 uppercase tracking-wide">Email</th>
            <th className="p-4 text-sm font-extrabold text-primary-950 uppercase tracking-wide">Status</th>
            <th className="p-4 text-sm font-extrabold text-primary-950 uppercase tracking-wide">Role</th>
            <th className="p-4 text-sm font-extrabold text-primary-950 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-white/30 hover:bg-white/30 transition-colors">
              <td className="p-4">
                <div className="font-bold text-primary-950">{user.name || "Unknown"}</div>
              </td>
              <td className="p-4 text-primary-900/80 font-medium text-sm">{user.email}</td>
              <td className="p-4">
                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg border shadow-sm ${
                  user.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-analogous2-600 border-gray-200'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-primary-900/80">
                  {user.role === 'ADMIN' ? <Shield className="w-4 h-4 text-accent-600" /> : <UserIcon className="w-4 h-4" />}
                  {user.role}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {user.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleUpdate(user.id, { status: "APPROVED" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdate(user.id, { status: "PENDING" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <X className="w-3 h-3" /> Revoke
                    </button>
                  )}
                  {user.role === 'USER' && (
                    <button 
                      onClick={() => handleUpdate(user.id, { role: "ADMIN" })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent-500 text-white hover:bg-accent-600 rounded-xl text-xs font-bold shadow-md transition"
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
