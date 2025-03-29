import { BellIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(db, "Notifications"),
            where("userId", "==", user.id),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notes);
        });

        return () => unsubscribe();
    }, [user?.id]);

    const markAsRead = async (notificationId) => {
        await db.doc(`Notifications/${notificationId}`).update({ read: true });
    };

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="ghost" className="relative">
                    <BellIcon className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-4 w-4 text-xs flex items-center justify-center">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="p-2">
                    <h3 className="font-semibold mb-2">Notifications</h3>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = `/view-report/${notification.reportId}`;
                            }}
                        >
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(notification.createdAt?.toDate()).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default NotificationBell