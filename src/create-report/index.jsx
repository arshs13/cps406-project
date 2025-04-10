import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useRef, useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';

// Google Maps API Necessities
import { Autocomplete, GoogleMap, LoadScript, Marker, useJsApiLoader } from '@react-google-maps/api';

function CreateReport() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- Google Maps state & refs ---
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
        libraries: ['places'],
    });
    const defaultCenter = { lat: 43.651070, lng: -79.347015 };
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [marker, setMarker] = useState(null);
    const autoRef = useRef(null);
    const inputRef = useRef(null);

    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    // Handle place selection from autocomplete
    const onLoadAutocomplete = (autocomplete) => {
        autoRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        const place = autoRef.current.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const label = place.formatted_address || place.name;

        setMarker({ lat, lng });
        setMapCenter({ lat, lng });

        if (inputRef.current) inputRef.current.value = label;

        handleInputChange('location', {
            label,
            placeId: place.place_id,
            lat: lat.toString(),
            lng: lng.toString(),
        });
    };

    // Reverse geocode click
    const geocodeLatLng = (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject('Geocode failed: ' + status);
                }
            });
        });
    };

    // Handle map click
    const onMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        let address = 'Unknown location'
        try {
            address = await geocodeLatLng(lat, lng);
        } catch (err) {
            console.error(err);
            toast.error('Failed to get address');
        }

        setMarker({ lat, lng });
        setMapCenter({ lat, lng });

        if (inputRef.current) inputRef.current.value = address;

        handleInputChange('location', {
            label: address,
            lat: lat.toString(),
            lng: lng.toString(),
        });
    }

    // --- Duplicate detection helper functions ---
    // Haversine formula to calculate distance in meters between two coordinates
    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const toRad = (x) => (x * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Check for duplicate reports within a given threshold (default 100 meters)
    const checkForDuplicate = async (newLocation, category, threshold = 100) => {
        const reportsSnapshot = await getDocs(collection(db, "Reports"));
        const duplicates = [];
        reportsSnapshot.forEach(doc => {
            const report = doc.data();
            if (report.location && report.location.lat && report.location.lng && report.category === category) {
                const distance = getDistance(
                    parseFloat(newLocation.lat),
                    parseFloat(newLocation.lng),
                    parseFloat(report.location.lat),
                    parseFloat(report.location.lng)
                );
                if (distance < threshold) {
                    duplicates.push(report);
                }
            }
        });
        return duplicates;
    };

    // --- Auth & Save logic ---
    const login = useGoogleLogin({
        onSuccess: (codeResp) => GetUserProfile(codeResp),
        onError: (error) => console.log(error)
    })

    const OnGenerateReport = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            setOpenDialog(true);
            return;
        }
        const requiredFields = ['title', 'category', 'description'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            toast(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }
        if (!formData.location) {
            toast('Please select a valid location');
            return;
        }
        console.log(formData);
        SaveReport();
    }

    const SaveReport = async () => {
        setLoading(true);
        try {
            // Duplicate check before saving
            if (formData.location && formData.location.lat && formData.location.lng && formData.category) {
                const duplicates = await checkForDuplicate(formData.location, formData.category, 100); // 100 meter radius
                if (duplicates.length > 0) {
                    formData.isDuplicate = true;
                }
            }

            const user = JSON.parse(localStorage.getItem('user'));
            const docId = Date.now().toString();
            const reportData = {
                reportId: docId,
                title: formData.title,
                category: formData.category,
                description: formData.description,
                location: {
                    label: formData.location?.label || '',
                    placeId: formData.location?.place_id || '', // adjust as needed
                    lat: formData.location?.lat || null,
                    lng: formData.location?.lng || null,
                },
                notifications: formData.notifications || false,
                userName: user?.name,
                userEmail: user?.email,
                userId: user?.id,
                createdAt: new Date(),
                status: 'Pending',
                isDuplicate: formData.isDuplicate || false,
            };
            await setDoc(doc(db, "Reports", docId), reportData);

            if (reportData.isDuplicate) {
                toast('Potentially duplicate report submitted!');
            } else {
                toast.success("Report submitted successfully!");
            }

            console.log("Report ID:", docId);
            setLoading(false);
            navigate('/view-report/' + docId);
        } catch (error) {
            console.error("Error saving report:", error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const GetUserProfile = (tokenInfo) => {
        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
            headers: {
                Authorization: `Bearer ${tokenInfo?.access_token}`,
                Accept: 'Application/json',
            },
        }).then((resp) => {
            localStorage.setItem('user', JSON.stringify(resp.data));
            window.dispatchEvent(new Event('user-updated'));
            setOpenDialog(false);
            OnGenerateReport();
        })
            .catch((error) => {
                console.error('Profile fetch error:', error);
                toast.error('Failed to load user profile');
            });
    };

    const [place, setPlace] = useState();

    // Update mapCenter only when a new place is selected.
    useEffect(() => {
        if (place && place.value && place.value.geometry) {
            setMapCenter({
                lat: parseFloat(place.value.geometry.location.lat),
                lng: parseFloat(place.value.geometry.location.lng)
            });
        }
    }, [place]);

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    if (loadError) return <div>Map failed to load</div>;
    if (!isLoaded) return <div>Loading map…</div>;

    return (
        <div className='min-h-screen flex flex-col pt-10'>
            <div className='flex-1 px-10'>
                <h2 className='font-bold text-3xl'>Tell us about the problem</h2>
                <p className='mt-3 text-gray-500 text-xl'>Give us some details about the problem that will help us resolve it</p>

                <div className='mt-8 flex flex-col gap-6'>

                    <div>
                        <h2 className='text-xl my-3 font-medium'>Problem Title</h2>
                        <Input placeholder='Insert the problem title' type="email"
                            onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                    </div>

                    <div>
                        <h2 className='text-xl my-3 font-medium'>Problem Category</h2>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange('category', value)}
                        >
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Categories</SelectLabel>
                                    <SelectItem value="🛣️ Road & Traffic">Road & Traffic</SelectItem>
                                    <SelectItem value="🚌 Public Transportation">Public Transportation</SelectItem>
                                    <SelectItem value="🗑️ Waste & Cleanliness">Waste & Cleanliness</SelectItem>
                                    <SelectItem value="💧 Water & Sewage">Water & Sewage</SelectItem>
                                    <SelectItem value="🌳 Parks & Public Spaces">Parks & Public Spaces</SelectItem>
                                    <SelectItem value="💡 Streetlights & Electrical">Streetlights & Electrical</SelectItem>
                                    <SelectItem value="⚠️ Public Safety & Security">Public Safety & Security</SelectItem>
                                    <SelectItem value="🔊 Noise & Nuisance">Noise & Nuisance</SelectItem>
                                    <SelectItem value="🚧 Construction & Infrastructure">Construction & Infrastructure</SelectItem>
                                    <SelectItem value="🏠 Private Property & Bylaw Violations">Private Property & Bylaw Violations</SelectItem>
                                    <SelectItem value="🐾 Wildlife & Animal Control">Wildlife & Animal Control</SelectItem>
                                    <SelectItem value="♿ Accessibility Issues">Accessibility Issues</SelectItem>
                                    <SelectItem value="❓ Other">Other</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <h2 className='text-xl my-3 font-medium'>Problem Description</h2>
                        <Textarea placeholder="Insert a description of the problem"
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>

                    <div>
                        <h2 className="text-xl my-3 font-medium">Location of the Problem</h2>
                        <Autocomplete
                            onLoad={onLoadAutocomplete}
                            onPlaceChanged={onPlaceChanged}
                        >
                            <Input ref={inputRef} placeholder="Search for address…" />
                        </Autocomplete>
                    </div>

                    <div className="w-full h-[400px] mb-10">
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={mapCenter}
                            zoom={12}
                            onClick={onMapClick}
                            options={{
                                draggableCursor: 'pointer',
                                draggingCursor: 'grabbing'
                            }}
                        >
                            {marker && <Marker position={marker} />}
                        </GoogleMap>
                    </div>

                    <div className='flex items-center space-x-2 -mt-2'>
                        <Checkbox id='notifications'
                            checked={formData.notifications || false}
                            onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                        />
                        <label
                            htmlFor='notifications'
                            className='text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                            I want to receive notifications about the status of this problem
                        </label>
                    </div>

                </div>

                <div className='my-13 text-lg justify-center flex'>
                    <Button
                        size='lg'
                        className="text-lg cursor-pointer"
                        disabled={loading}
                        onClick={OnGenerateReport}>
                        {loading ?
                            <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Submit Report'
                        }
                    </Button>
                </div>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogDescription>
                                <div className="w-[160px] md:w-[180px] h-auto aspect-[1750/398]"> {/* 4.44:1 ratio */}
                                    <img
                                        src='/logo.png'
                                        className="w-full h-full object-contain"
                                        alt="Cypress Logo"
                                    />
                                </div>
                                <h2 className='font-bold text-lg mt-7'>Sign In With Google</h2>
                                <p>Securely sign in to Cypress with Google authentication</p>
                                <Button
                                    onClick={login}
                                    className='w-full mt-5 flex gap-4 items-center'>
                                    <FcGoogle className='h-7 w-7' />
                                    Sign in with Google
                                </Button>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Footer */}
            <div className="w-full text-center text-gray-500 border-t pt-6 pb-6 mx-0">
                <p>Created by Group 10 • Cypress</p>
            </div>
        </div>
    )
}

export default CreateReport