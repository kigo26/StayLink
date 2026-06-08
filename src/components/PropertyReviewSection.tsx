/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Property, Review } from '../types';

interface PropertyReviewSectionProps {
  property: Property;
}

export default function PropertyReviewSection({ property }: PropertyReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const reviewsRef = collection(db, 'properties', property.id, 'reviews');
    const q = query(reviewsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() as Review, id: doc.id }));
      setReviews(data);
    });

    return unsubscribe;
  }, [property.id]);

  const handleSubmit = async () => {
    if (rating === 0 || !auth.currentUser) return;
    setSubmitting(true);
    
    const reviewData: Omit<Review, 'id'> = {
      propertyId: property.id,
      tenantId: auth.currentUser.uid,
      tenantName: auth.currentUser.displayName || 'Anonymous',
      tenantAvatar: auth.currentUser.photoURL || '',
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Add Review
      await addDoc(collection(db, 'properties', property.id, 'reviews'), reviewData);
      
      // 2. Update Property Aggregate stats
      const propRef = doc(db, 'properties', property.id);
      const propSnap = await getDoc(propRef);
      const currentData = propSnap.data() as Property;
      
      const newReviewsCount = (currentData.reviewsCount || 0) + 1;
      const currentAvgRating = currentData.averageRating || 0;
      const newAvgRating = ((currentAvgRating * (currentData.reviewsCount || 0)) + rating) / newReviewsCount;
      
      await updateDoc(propRef, {
        reviewsCount: newReviewsCount,
        averageRating: newAvgRating
      });
      
      setRating(0);
      setComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-3xl border border-neutral-100 shadow-3xs space-y-4">
      <h3 className="font-bold text-neutral-900 text-sm">Tenant Reviews ({reviews.length})</h3>
      
      {/* Submit Form */}
      {auth.currentUser && (
        <div className="space-y-2">
            <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={`w-6 h-6 cursor-pointer ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                        onClick={() => setRating(s)}
                    />
                ))}
            </div>
            <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was your stay?"
                className="w-full text-xs p-3 border rounded-xl"
            />
            <button 
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map(r => (
            <div key={r.id} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between">
                    <span className="font-bold">{r.tenantName}</span>
                    <span className="flex items-center text-amber-500 font-bold"><Star className="w-3 h-3 fill-current"/> {r.rating}</span>
                </div>
                <p className="text-neutral-600 mt-1">{r.comment}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
