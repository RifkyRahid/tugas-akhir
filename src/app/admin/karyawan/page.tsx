"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/lib/auth";

import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";

import "@/styles/dashboard.css";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  position?: string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  test     : string;
};

export default function KelolaKaryawanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const [showAddModal, setShowAddModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedUser: User) => {
    try {
      const res = await fetch(`/api/karyawan/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        alert("Gagal update data.");
      }
    } catch (error) {
      console.error("Error update:", error);
      alert("Terjadi kesalahan saat mengedit.");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/karyawan/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
        setShowModal(false);
        setSelectedUser(null);
      } else {
        alert("Gagal menghapus karyawan.");
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (!user || user.role !== "admin") {
      router.push("/login");
    } else {
      fetch("/api/karyawan")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Gagal fetch data karyawan:", err));
    }
  }, [router]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          + Tambah Karyawan
        </button>

        <h1 style={{ color: "#0d47a1" }}>Kelola Karyawan</h1>
        <table className="styled-table">
          {showAddModal && (
            <AddUserModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onUserAdded={(newUser: User) =>
                setUsers((prev) => [...prev, newUser])
              }
            />
          )}

          <thead>
            <tr>
              <th>#</th>
              <th>ID Karyawan</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Join Date</th>
              <th>Created At</th>
              <th>Action</th>
              <th>Test</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                
                <td>{user.position || "-"}</td>
                <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-action edit"
                    onClick={() => handleEditClick(user)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => confirmDelete(user)}
                  >
                    ❌
                  </button>
                </td>
                <td>{user.test}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <DeleteConfirmModal
          isOpen={showModal}
          userName={selectedUser.name}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      )}

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onCancel={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
