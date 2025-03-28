import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react'
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
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";


function CreateReport() {
    const [place, setPlace] = useState();

    const [formData, setFormData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    useEffect(() => {
        console.log(formData);
    }, [formData]);

/*     useEffect(() => {
        return () => {
            if (formData.image?.preview) {
                URL.revokeObjectURL(formData.image.preview);
            }
        };
    }, [formData.image]); */

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

        /* if (formData.image?.file) {
            const error = validateImageFile(formData.image.file);
            if (error) {
                toast(error);
                return;
            }
        } */

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
            const user = JSON.parse(localStorage.getItem('user'));

            /* let imageUrl = null;
            if (formData.image?.file) {
                const storageRef = ref(storage, `reports/${user.id}/${formData.image.file.name}`);
                const snapshot = await uploadBytes(storageRef, formData.image.file);
                imageUrl = await getDownloadURL(snapshot.ref);
            } */

            const reportData={
                title: formData.title,
                category: formData.category,
                description: formData.description,
                location: {
                    label: formData.location?.label || '',
                    placeId: formData.location?.value?.place_id || ''
                },
                notifications: formData.notifications || false,
                userName: user?.name,
                userEmail: user?.email,
                userId: user?.id,
                createdAt: new Date(),
                status: 'pending'
            };

            const docId = Date.now().toString();
            await setDoc(doc(db, "Reports", docId), reportData);

            toast.success("Report submitted successfully!");
            console.log("Report ID:", docId);

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
                Accept: 'Application/json'
            }
        }).then((resp) => {
            console.log(resp);
            localStorage.setItem('user', JSON.stringify(resp.data));
            setOpenDialog(false);
            OnGenerateReport();
        })
    }

    /* const validateImageFile = (file) => {
        if (!file) return null;

        const MAX_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        if (!file.type.startsWith('image/')) {
            return 'Please select an image file';
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Please upload a valid image file (JPEG, PNG, or WEBP)';
        }

        if (file.size > MAX_SIZE) {
            return `File size must be less than ${MAX_SIZE / 1024 / 1024}MB`;
        }

        return null;
    }; */

    return (
        <div className='sm:px-10 md:px-32 lf:px-56 xl:px-10 px-5 mt-10'>
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
                                <SelectItem value="Road & Traffic">Road & Traffic</SelectItem>
                                <SelectItem value="Public Transportation">Public Transportation</SelectItem>
                                <SelectItem value="Waste & Cleanliness">Waste & Cleanliness</SelectItem>
                                <SelectItem value="Water & Sewage">Water & Sewage</SelectItem>
                                <SelectItem value="Parks & Public Spaces">Parks & Public Spaces</SelectItem>
                                <SelectItem value="Streetlights & Electrical">Streetlights & Electrical</SelectItem>
                                <SelectItem value="Public Safety & Security">Public Safety & Security</SelectItem>
                                <SelectItem value="Noise & Nuisance">Noise & Nuisance</SelectItem>
                                <SelectItem value="Construction & Infrastructure">Construction & Infrastructure</SelectItem>
                                <SelectItem value="Private Property & Bylaw Violations">Private Property & Bylaw Violations</SelectItem>
                                <SelectItem value="Wildlife & Animal Control">Wildlife & Animal Control</SelectItem>
                                <SelectItem value="Accessibility Issues">Accessibility Issues</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
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
                    <h2 className='text-xl my-3 font-medium'>Location of the Problem</h2>
                    <GooglePlacesAutocomplete
                        apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                        selectProps={{
                            place,
                            onChange: (v) => { setPlace(v); handleInputChange('location', v) }
                        }}
                    />
                </div>

{/*                 <div className="grid w-full max-w-sm items-center gap-0.5">
                    <h2 className='text-xl my-3 font-medium'>Please Upload an Image of the Problem</h2>
                    <Input
                        id="picture"
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const error = validateImageFile(file);
                            if (error) {
                                toast(error);
                                e.target.value = '';
                                return;
                            }

                            handleInputChange('image', {
                                file,
                                preview: URL.createObjectURL(file)
                            });
                        }}
                    />
                    {formData.image?.preview && (
                        <div className='mt-4'>
                            <img
                                src={formData.image.preview}
                                alt='Problem preview'
                                className='max-w-[300px] rounded-lg border'
                            />
                        </div>
                    )}
                </div> */}

                <div className='flex items-center space-x-2 mt-5'>
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

            <div className='my-10 text-lg justify-center flex'>
                <Button
                    disabled={loading}
                    onClick={OnGenerateReport}>
                    {loading ?
                        <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Submit Report'
                    }
                    </Button>
            </div>

            <Dialog open={openDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogDescription>
                            <img src="/logo.svg" />
                            <h2 className='font-bold text-lg mt-7'>Sign In With Google</h2>
                            <p>Securely sign in to Cypress with Google authentication</p>

                            <Button
                                onClick={login}
                                className='w-full mt-5 flex gap-4 items-center'>
                                <FcGoogle className='h-7 w-7' />
                                Sign In With Google
                            </Button>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default CreateReport