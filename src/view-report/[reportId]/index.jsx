import { db } from '@/service/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"

function ViewReport() {

    const { reportId } = useParams();
    const [report, setReport] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
        libraries: ['places']
    });

    if (loadError) return <div>Map failed to load</div>;

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
        reportId && GetReportData();
    }, [reportId])

    /**
     * Used to get report information from Firebase
     */
    const GetReportData = async () => {
        try {
            const docRef = doc(db, 'Reports', reportId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setReport(docSnap.data());
            } else {
                toast.error('No Report Found!');
            }
        } catch (error) {
            toast.error('Error retrieving report data.');
        }
    }

    const deleteReport = async () => {
        try {
            const docRef = doc(db, 'Reports', reportId);
            await deleteDoc(docRef);
            toast.success('Report has been deleted successfully!');
            setTimeout(() => {
                window.location.href = '/my-reports';
            }, 0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete report.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className='max-w-4xl mx-auto p-6 space-y-8 flex-1 w-full'>
                {/* Header Section */}
                <div className="border-b pb-3">
                    <div className="grid grid-cols-2 grid-rows-2 gap-y-2">
                        {/* Top Row: Left = Title; Right = Report ID */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                {report?.title}
                                {report?.isDuplicate && (
                                    <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                                        Duplicate
                                    </span>
                                )}
                            </h1>
                        </div>
                        <div className="text-right">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-600">
                                ID: #{report?.reportId}
                            </span>
                        </div>

                        {/* Bottom Row: Left = Status & Reported Date; Right = Delete Button */}
                        <div className="flex items-center gap-3">
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
                        <div className="text-right">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-sm border border-gray-300">
                                        Delete Report
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the report.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteReport}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
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
                            <div className="mt-4 h-64 bg-gray-100 rounded-lg">
                                {(!isLoaded || !report?.location?.lat) ? (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Loading map…
                                    </div>
                                ) : (
                                    <GoogleMap
                                        key={`${report.location.lat}-${report.location.lng}`}
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{
                                            lat: parseFloat(report.location.lat),
                                            lng: parseFloat(report.location.lng),
                                        }}
                                        zoom={12}
                                        options={{
                                            draggableCursor: 'pointer',
                                            draggingCursor: 'grabbing'
                                        }}
                                    >
                                        <Marker
                                            position={{
                                                lat: parseFloat(report.location.lat),
                                                lng: parseFloat(report.location.lng),
                                            }}
                                        />
                                    </GoogleMap>
                                )}
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
                    <p className={`text-lg ${report?.notifications ? 'text-green-600' : 'text-gray-500'}`}>
                        {report?.notifications ? 'Enabled' : 'Disabled'}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 w-full text-center text-gray-500 border-t pt-6 pb-6 mx-0">
                <p>Created by Group 10 • Cypress</p>
            </div>
        </div>
    );
}

export default ViewReport