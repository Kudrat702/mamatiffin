import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Tag, RotateCcw, Loader2, BookOpen, AlertTriangle, Plus } from 'lucide-react';
import type { Book } from '../configapi/api';
import {
  getMyBookListings,
  markBookAsSold,
  relistBook,
  deleteBookListing,
} from '../configapi/api';

const MyListingsPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'sold'; bookId: string; bookName: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      sessionStorage.setItem('redirectAfterLogin', '/books/my-listings');
      window.location.href = '/home';
    }
  }, [isAuthenticated, token, authLoading]);

  const refreshList = async (currentToken: string): Promise<void> => {
    try {
      const data = await getMyBookListings(currentToken);
      setBooks(data);
    } catch (err) {
      console.error('Fetch listings error:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    const fetchInitial = async (): Promise<void> => {
      setLoading(true);
      await refreshList(token);
      setLoading(false);
    };
    fetchInitial();
  }, [token]);

  const handleMarkSold = async (bookId: string): Promise<void> => {
    setActionLoading(true);
    try {
      await markBookAsSold(bookId, token);
      await refreshList(token);
    } catch (err) {
      console.error('Mark sold error:', err);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleRelist = async (bookId: string): Promise<void> => {
    setActionLoading(true);
    try {
      await relistBook(bookId, token);
      await refreshList(token);
    } catch (err) {
      console.error('Relist error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (bookId: string): Promise<void> => {
    setActionLoading(true);
    try {
      await deleteBookListing(bookId, token);
      await refreshList(token);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'available') return b.status === 'Available';
    if (filter === 'sold') return b.status === 'Sold';
    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BookOpen size={32} className="text-[rgb(50,140,129)]" />
              My Book Listings
            </h1>
            <p className="text-gray-600 mt-1">Manage all your listed books</p>
          </div>
          <button onClick={() => (window.location.href = '/books/sell')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
            <Plus size={18} /> List New Book
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm w-fit">
          {(['all', 'available', 'sold'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg font-medium text-sm transition-all capitalize ${filter === f ? 'bg-[rgb(50,140,129)] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {f} {f !== 'all' && `(${books.filter((b) => b.status.toLowerCase() === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[rgb(50,140,129)]" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Start by listing your first book.</p>
            <button onClick={() => (window.location.href = '/books/sell')} className="px-6 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
              <Plus size={18} /> List a Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div key={book._id} className={`bg-white rounded-2xl shadow-md overflow-hidden ${book.status === 'Sold' ? 'opacity-75' : ''}`}>
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img src={book.images[0]?.url} alt={book.bookName} loading="lazy" className={`w-full h-full object-cover ${book.status === 'Sold' ? 'grayscale' : ''}`} />
                  {book.status === 'Sold' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="bg-red-500 text-white px-4 py-1.5 rounded-lg font-bold text-lg shadow-lg">SOLD</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                    {book.class} • {book.subject}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[3rem]">{book.bookName}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[rgb(50,140,129)]">₹{book.price}</span>
                    <span className="text-xs text-gray-500">{new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {book.status === 'Available' ? (
                      <button onClick={() => setConfirmAction({ type: 'sold', bookId: book._id, bookName: book.bookName })} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all">
                        <Tag size={14} /> Mark Sold
                      </button>
                    ) : (
                      <button onClick={() => handleRelist(book._id)} disabled={actionLoading} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all disabled:opacity-60">
                        <RotateCcw size={14} /> Relist
                      </button>
                    )}
                    <button onClick={() => setConfirmAction({ type: 'delete', bookId: book._id, bookName: book.bookName })} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all border border-red-200">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !actionLoading && setConfirmAction(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-full ${confirmAction.type === 'delete' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <AlertTriangle size={24} className={confirmAction.type === 'delete' ? 'text-red-600' : 'text-blue-600'} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {confirmAction.type === 'delete' ? 'Delete this listing?' : 'Mark as sold?'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {confirmAction.type === 'delete'
                      ? `"${confirmAction.bookName}" will be permanently removed. This cannot be undone.`
                      : `"${confirmAction.bookName}" will be hidden from the Buy page. You can relist it anytime.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmAction(null)} disabled={actionLoading} className="px-5 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction.type === 'delete' ? handleDelete(confirmAction.bookId) : handleMarkSold(confirmAction.bookId)}
                  disabled={actionLoading}
                  className={`px-5 py-2 rounded-lg font-semibold text-white disabled:opacity-60 flex items-center gap-2 ${confirmAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  {confirmAction.type === 'delete' ? 'Delete' : 'Mark Sold'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;