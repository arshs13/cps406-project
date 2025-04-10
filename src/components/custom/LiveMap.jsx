// LiveMap.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const defaultCenter = { lat: 43.651070, lng: -79.347015 };

const LiveMap = () => {
    const [reports, setReports] = useState([]);
    const [activeReport, setActiveReport] = useState(null);

    // Load the Google Maps API using the provided API key from your .env.local file
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
        libraries: ['places']
    });

    // Subscribe to Firestore real-time updates from the 'Reports' collection
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Reports'), (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportsData);
        });
        return () => unsubscribe();
    }, []);

    if (loadError) return <div>Error loading map</div>;
    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
        >
            {reports.map(report => (
                <Marker
                    key={report.reportId || report.id}
                    position={{
                        lat: parseFloat(report.location.lat),
                        lng: parseFloat(report.location.lng)
                    }}
                    onClick={() => setActiveReport(report)}
                />
            ))}

            {activeReport && (
                <InfoWindow
                    position={{
                        lat: parseFloat(activeReport.location.lat),
                        lng: parseFloat(activeReport.location.lng)
                    }}
                    onCloseClick={() => setActiveReport(null)}
                >
                    <div style={{ maxWidth: '250px', padding: '10px', fontFamily: 'Arial, sans-serif' }}>
                        <h3 style={{
                            margin: '0 0 10px 0',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            {activeReport.title}
                        </h3>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#555'
                        }}>
                            <strong>Status:</strong> {activeReport.status}
                        </p>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#555'
                        }}>
                            <strong>Category:</strong> {activeReport.category}
                        </p>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#555'
                        }}>
                            <strong>Location:</strong> {activeReport.location.label}
                        </p>
                        {activeReport.createdAt && activeReport.createdAt.seconds && (
                            <p style={{
                                margin: '5px 0',
                                fontSize: '12px',
                                color: '#777'
                            }}>
                                <strong>Submitted:</strong> {new Date(activeReport.createdAt.seconds * 1000).toLocaleString()}
                            </p>
                        )}
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default LiveMap;
