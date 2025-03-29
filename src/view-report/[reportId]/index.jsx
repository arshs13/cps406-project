import { Button } from '@/components/ui/button';
import { db } from '@/service/firebaseConfig';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';

function ViewReport() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { reportId } = useParams();
    const [report, setReport] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    const formatDateTime = (timestamp) => {
        if (!timestamp?.seconds) return 'N/A';

        const date = new Date(timestamp.seconds * 1000);
        return {
            date: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const { date: formattedDate, time: formattedTime } = formatDateTime(report?.createdAt);

    useEffect(() => {
        if (!reportId) return;

        const reportRef = doc(db, 'Reports', reportId);
        const unsubscribe = onSnapshot(reportRef, (doc) => {
            if (doc.exists()) {
                const reportData = doc.data();
                setReport(reportData);
                setIsSubscribed(reportData.subscribers?.includes(user?.id) ?? false);
            } else {
                toast.error('No Report Found!');
            }
        });

        return () => unsubscribe();
    }, [reportId, user?.id]);

    /**
     * Used to get report information from Firebase
     */
    const GetReportData = async () => {
        const docRef = doc(db, 'Reports', reportId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setReport(docSnap.data());
        }
        else {
            toast.error('No Report Found!');
        }
    }

    const handleSubscribe = async (subscribe) => {
        if (!user) {
            toast.error('Please sign in to manage notifications');
            return;
        }

        try {
            const reportRef = doc(db, "Reports", reportId);
            await updateDoc(reportRef, {
                subscribers: isSubscribed
                ? arrayRemove(user.id)
                : arrayUnion(user.id)
            });

            setIsSubscribed(!isSubscribed);
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Failed to update subscription");
        }
    };

    if (!report) return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <div className='max-w-4xl mx-auto p-6 space-y-8 flex-1 w-full'>
                {/* Header Section */}
                <div className="space-y-4 border-b pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{report?.title}</h1>
                            <div className="mt-2 flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                ${report?.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                                        report?.status === 'In-Progress' ? 'bg-yellow-100 text-yellow-800' :
                                            report?.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                report?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                    {report?.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Reported on {formattedDate} at {formattedTime}
                                </span>
                            </div>
                        </div>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-600">
                            ID: #{report?.reportId}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Category</h2>
                            <p className="text-gray-700">{report?.category}</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {report?.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
                            <p className="text-gray-700">
                                {report?.location?.label || 'No location specified'}
                            </p>
                            <div className="mt-4 h-48 bg-gray-100 rounded-lg">
                                {/* Map placeholder */}
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Map preview
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Submitted By</h2>
                            <div className="space-y-2">
                                <p className="text-gray-700">{report?.userEmail}</p>
                                <p className="text-sm text-gray-500">
                                    User ID: {report?.userId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <div className='flex items-center justify-between'>
                        <p className={`text-lg ${isSubscribed ? 'text-green-600' : 'text-gray-500'}`}>
                            {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                        </p>
                        <Button
                            variant='outline'
                            onClick={handleSubscribe}
                            disabled={!user}
                        >
                            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                    </div>
                    {!user && (
                        <p className='text-sm text-gray-500 mt-2'>
                            Sign in to receive status updates
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 w-full text-center text-gray-500 border-t pt-6 pb-6 mx-0">
                <p>Created by Group 42 • Cypress</p>
            </div>
        </div>
    );
}

export default ViewReport