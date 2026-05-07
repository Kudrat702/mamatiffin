import React, { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Upload, X, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import {
  BOOK_CLASSES,
  BOOK_CONDITIONS,
  SUBJECTS_BY_CLASS,
  createBookListing,
} from '../configapi/api';
import type {
  BookClass,
  BookCondition,
} from '../configapi/api';

interface LocalUser {
  id: string;
  name: string;
  phone: string;
  address?: {
    district?: string;
    block?: string;
    city?: string;
    homeLodgeName?: string;
  };
}

const SellBookPage: React.FC = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [token, setToken] = useState<string>('');

  const [bookName, setBookName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [bookClass, setBookClass] = useState<BookClass | ''>('');
  const [subject, setSubject] = useState<string>('');
  const [condition, setCondition] = useState<BookCondition>('Good');
  const [description, setDescription] = useState<string>('');
  const [sellerName, setSellerName] = useState<string>('');
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');
    if (!savedUser || !savedToken) {
      sessionStorage.setItem('redirectAfterLogin', '/books/sell');
      window.location.href = '/home';
      return;
    }
    const u: LocalUser = JSON.parse(savedUser);
    setUser(u);
    setToken(savedToken);
    setSellerName(u.name || '');
    setSellerPhone(u.phone || '');
    if (u.address) {
      const addr = [u.address.homeLodgeName, u.address.block, u.address.city, u.address.district]
        .filter(Boolean).join(', ');
      setSellerAddress(addr);
    }
  }, []);

  const subjectOptions = useMemo<string[]>(() => {
    if (!bookClass) return [];
    return SUBJECTS_BY_CLASS[bookClass];
  }, [bookClass]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    setError('');
    const next = [...images, ...files];
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number): void => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (images.length === 0) { setError('Please upload at least 1 image'); return; }
    if (!bookClass || !subject) { setError('Please select class and subject'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      formData.append('bookName', bookName);
      formData.append('price', price);
      formData.append('class', bookClass);
      formData.append('subject', subject);
      formData.append('condition', condition);
      formData.append('description', description);
      formData.append('sellerName', sellerName);
      formData.append('sellerPhone', sellerPhone);
      formData.append('sellerAddress', sellerAddress);

      await createBookListing(formData, token);

      setSuccess(true);
      setTimeout(() => { window.location.href = '/books/my-listings'; }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list book';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Listed Successfully!</h2>
          <p className="text-gray-600">Redirecting to your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sell Your Book</h1>
          <p className="text-gray-600 mt-2">Help other students. List your book in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Book Images (1-3) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                  <img src={src} alt={`preview ${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[rgb(50,140,129)] hover:bg-blue-50 transition-all">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Image</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Max 5MB per image. JPG, PNG, WEBP allowed.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Book Name <span className="text-red-500">*</span></label>
              <input type="text" required value={bookName} onChange={(e) => setBookName(e.target.value)} placeholder="e.g. NCERT Class 10 Math" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" required min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 250" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class <span className="text-red-500">*</span></label>
              <select required value={bookClass} onChange={(e) => { setBookClass(e.target.value as BookClass); setSubject(''); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none bg-white">
                <option value="">Select Class</option>
                {BOOK_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
              <select required value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!bookClass} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none bg-white disabled:bg-gray-100">
                <option value="">{bookClass ? 'Select Subject' : 'Select Class First'}</option>
                {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
            <div className="flex gap-3">
              {BOOK_CONDITIONS.map((c) => (
                <label key={c} className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center font-medium transition-all ${condition === c ? 'border-[rgb(50,140,129)] bg-[rgb(50,140,129)] bg-opacity-10 text-[rgb(50,140,129)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)} className="hidden" />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="Any extra details — minor marks, edition year, etc." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[rgb(50,140,129)] focus:ring-2 focus:ring-[rgb(50,140,129)] focus:ring-opacity-20 outline-none resize-none" />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Your Contact Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-[rgb(50,140,129)]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" required value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-[rgb(50,140,129)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address <span className="text-red-500">*</span></label>
                <textarea required value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} rows={2} placeholder="Area, City, District" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-[rgb(50,140,129)] resize-none" />
              </div>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
            {loading ? <><Loader2 size={20} className="animate-spin" /> Listing...</> : 'List My Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellBookPage;