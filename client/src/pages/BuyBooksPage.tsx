import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Phone, MessageCircle, MapPin, X,
  ChevronLeft, ChevronRight, Loader2, BookOpen, Filter,
} from 'lucide-react';
import {
  BOOK_CLASSES,
  SUBJECTS_BY_CLASS,
  getAllBooks,
} from '../configapi/api';
import type {
  BookClass,
  Book,
} from '../configapi/api';
import { useAuth } from '../context/AuthContext';

const BuyBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<BookClass | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [imageIdx, setImageIdx] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { user } = useAuth();

  const subjectOptions = useMemo<string[]>(() => {
    if (!selectedClass) return [];
    return SUBJECTS_BY_CLASS[selectedClass];
  }, [selectedClass]);

  useEffect(() => {
    const fetchBooks = async (): Promise<void> => {
      setLoading(true);
      try {
        const result = await getAllBooks({
          class: selectedClass || undefined,
          subject: selectedSubject || undefined,
          search: search || undefined,
        });
        setBooks(result.books);
      } catch (err) {
        console.error('Fetch books error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [selectedClass, selectedSubject, search]);

  const clearFilters = (): void => {
    setSelectedClass('');
    setSelectedSubject('');
    setSearch('');
  };

  const handleViewDetails = (book: Book): void => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/books/buy');
      window.dispatchEvent(new CustomEvent('triggerLogin'));
      return;
    }
    setSelectedBook(book);
    setImageIdx(0);
  };

  const handleCall = (phone: string): void => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string, bookName: string): void => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`Hi, I'm interested in your book "${bookName}" listed on mamatiffin. Is it still available?`);
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Buy Used Books</h1>
          <p className="text-gray-600 mt-2">Affordable books from fellow students</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by book name..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[rgb(50,140,129)] text-white font-medium">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-md p-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
                {(selectedClass || selectedSubject || search) && (
                  <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear All</button>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <div className="grid grid-cols-2 gap-2">
                  {BOOK_CLASSES.map((c) => (
                    <button key={c} onClick={() => { setSelectedClass(c === selectedClass ? '' : c); setSelectedSubject(''); }} className={`py-2 rounded-lg font-medium transition-all ${selectedClass === c ? 'bg-[rgb(50,140,129)] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {selectedClass && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <div className="space-y-1.5">
                    {subjectOptions.map((s) => (
                      <button key={s} onClick={() => setSelectedSubject(s === selectedSubject ? '' : s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === s ? 'bg-[rgb(50,140,129)] text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-[rgb(50,140,129)]" />
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                  <div key={book._id} onClick={() => handleViewDetails(book)} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                    <div className="aspect-square overflow-hidden bg-gray-100 relative">
                      <img src={book.images[0]?.url} alt={book.bookName} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                        {book.class} • {book.subject}
                      </div>
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold ${book.condition === 'New' ? 'bg-green-500 text-white' : book.condition === 'Good' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'}`}>
                        {book.condition}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[3rem]">{book.bookName}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[rgb(50,140,129)]">₹{book.price}</span>
                        <span className="text-xs text-gray-500">{new Date(book.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {selectedBook && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedBook(null)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="font-bold text-lg text-gray-800 line-clamp-1">{selectedBook.bookName}</h2>
                <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <img src={selectedBook.images[imageIdx]?.url} alt={selectedBook.bookName} loading="lazy" className="w-full h-full object-contain" />
                  {selectedBook.images.length > 1 && (
                    <>
                      <button onClick={() => setImageIdx((i) => (i === 0 ? selectedBook.images.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => setImageIdx((i) => (i === selectedBook.images.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white">
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedBook.images.map((_, i) => (
                          <button key={i} onClick={() => setImageIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === imageIdx ? 'bg-white w-6' : 'bg-white/60'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-3xl font-bold text-[rgb(50,140,129)]">₹{selectedBook.price}</span>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold">{selectedBook.class}</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-semibold">{selectedBook.subject}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">{selectedBook.condition}</span>
                  </div>
                </div>

                {selectedBook.description && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
                    <p className="text-gray-600 text-sm">{selectedBook.description}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 mb-2">Seller Details</h3>
                  <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedBook.sellerName}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-800">{selectedBook.sellerPhone}</span></p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{selectedBook.sellerAddress}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleCall(selectedBook.sellerPhone)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
                    <Phone size={18} /> Call
                  </button>
                  <button onClick={() => handleWhatsApp(selectedBook.sellerPhone, selectedBook.bookName)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-[#25D366] hover:bg-[#20bd5a]">
                    <MessageCircle size={18} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyBooksPage;