'use client'; // ทำให้ component นี้เป็น client component (ใช้ hooks ได้ เช่น useState, useEffect)

import { useEffect, useState } from 'react';

// สร้าง type สำหรับ user
type User = {
  id: number;
  name: string;
  email: string;
};

export default function UsersPage() {
  // State สำหรับจัดเก็บข้อมูลต่าง ๆ
  const [users, setUsers] = useState<User[]>([]); // รายชื่อผู้ใช้ทั้งหมด
  const [name, setName] = useState(''); // ค่าชื่อจาก input
  const [email, setEmail] = useState(''); // ค่าอีเมลจาก input
  const [error, setError] = useState(''); // เก็บข้อความ error ถ้ามี
  const [editingUser, setEditingUser] = useState<User | null>(null); // ถ้าไม่ null แปลว่ากำลังแก้ไข user

  // เมื่อ component โหลดครั้งแรก ให้ดึงข้อมูลจาก API
  useEffect(() => {
    fetchUsers();
  }, []);

  // ดึงข้อมูลผู้ใช้จาก API
  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data); // บันทึกข้อมูลลง state
  };

  // เมื่อ submit ฟอร์ม (เพิ่มหรือแก้ไขผู้ใช้)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้ reload หน้า
    setError('');

    if (!name || !email) {
      setError('Please fill in all fields'); // ตรวจสอบว่ากรอกครบไหม
      return;
    }

    if (editingUser) {
      // แก้ไขผู้ใช้ที่มีอยู่แล้ว
      const res = await fetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ id: editingUser.id, name, email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setError('Failed to update user');
        return;
      }

      // อัปเดตข้อมูลใน state
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, name, email } : u))
      );

      setEditingUser(null); // รีเซ็ตสถานะแก้ไข
    } else {
      // เพิ่มผู้ใช้ใหม่
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setError('Failed to add user');
        return;
      }

      const data = await res.json();
      setUsers((prev) => [...prev, data]); // เพิ่มผู้ใช้ใหม่เข้า array
    }

    // รีเซ็ต input
    setName('');
    setEmail('');
  };

  // ลบผู้ใช้
  const handleDelete = async (id: number) => {
    const res = await fetch('/api/users', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return alert('Failed to delete');

    // ลบออกจาก state
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  // กดปุ่ม Edit เพื่อกรอกข้อมูลเดิมลงในฟอร์ม
  const handleEdit = (user: User) => {
    setEditingUser(user); // ตั้งค่า user ที่จะถูกแก้ไข
    setName(user.name); // เติมชื่อใน input
    setEmail(user.email); // เติม email ใน input
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">User Management</h1>

      {/* ตารางแสดงรายการผู้ใช้ */}
      <table className="w-full border border-gray-200 shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User) => (
            <tr key={user.id} className="border-t text-sm">
              <td className="p-2">{user.id}</td>
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ฟอร์มเพิ่มหรือแก้ไขผู้ใช้ */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">
          {editingUser ? 'Edit User' : 'Add New User'}
        </h2>

        {/* แสดง error ถ้ามี */}
        {error && <p className="text-red-500">{error}</p>}

        {/* ช่องกรอกชื่อ */}
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* ช่องกรอกอีเมล */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ปุ่ม Add หรือ Update */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingUser ? 'Update' : 'Add'}
          </button>

          {/* ปุ่ม Cancel (เฉพาะตอน Edit) */}
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null); // ยกเลิกการแก้ไข
                setName('');
                setEmail('');
              }}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
