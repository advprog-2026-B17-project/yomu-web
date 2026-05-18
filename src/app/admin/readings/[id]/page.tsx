'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Reading {
  id: string;
  title: string;
  content: string;
  category: { name: string } | null;
}

export default function AdminReadingDetailPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const readingId = params.id as string;

  const [reading, setReading] = useState<Reading | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchData();
  }, [user, token, readingId]);

  const fetchData = async () => {
    try {
      const [readingRes, questionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/readings/${readingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/reading/${readingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (readingRes.ok) setReading(await readingRes.json());
      if (questionsRes.ok) setQuestions(await questionsRes.json());
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ readingId, ...form }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
        fetchData();
      }
    } catch {
      alert('Error');
    }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/readings" className="text-sm text-slate-500 hover:text-slate-700 mb-1 block">
            ← Kembali ke Daftar Bacaan
          </Link>
          <h2 className="text-2xl font-bold">{reading?.title || 'Loading...'}</h2>
          {reading?.category && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
              {reading.category.name}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Batal' : '+ Tambah Soal'}
        </button>
      </div>

      {/* Reading Preview */}
      {reading && (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg border">
          <p className="text-sm text-slate-600 line-clamp-3">{reading.content}</p>
        </div>
      )}

      {/* Question Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl border space-y-4">
          <h3 className="font-semibold">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Pertanyaan</label>
            <textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Opsi Jawaban</label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={form.correctAnswer === i}
                  onChange={() => setForm({ ...form, correctAnswer: i })}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...form.options];
                    newOpts[i] = e.target.value;
                    setForm({ ...form, options: newOpts });
                  }}
                  placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Penjelasan (opsional)</label>
            <input
              type="text"
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Penjelasan jawaban benar"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {editingId ? 'Update' : 'Simpan'}
            </button>
            <button type="button" onClick={cancelEdit} className="px-4 py-2 border rounded-lg">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <h3 className="font-semibold mb-4">Daftar Soal ({questions.length})</h3>
      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : questions.length === 0 ? (
        <p className="text-slate-500">Belum ada soal. Tambahkan soal di atas.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-white rounded-xl border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs font-medium text-slate-500">Soal {idx + 1}</span>
                  <p className="font-medium mt-1">{q.questionText}</p>
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <p key={oi} className={`text-sm ${oi === q.correctAnswer ? 'text-green-600 font-medium' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswer && '✓'}
                      </p>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-slate-500 mt-2">💡 {q.explanation}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
