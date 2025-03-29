import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { toast } from 'sonner';

function ReportListener() {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, "Reports"),
      where("subscribers", "array-contains", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const newStatus = change.doc.data().status;
          const oldStatus = change.doc.previousData?.status;
          
          if (newStatus !== oldStatus && ['In-Progress', 'Resolved', 'Rejected'].includes(newStatus)) {
            toast.message("Status Update", {
                description: `Report "${change.doc.data().title}" changed to ${newStatus}`
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  return null;
}

export default ReportListener