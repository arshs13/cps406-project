import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

function CreateReport() {
    const [place, setPlace] = useState();
    return (
        <div className='sm:px-10 md:px-32 lf:px-56 xl:px-10 px-5 mt-10'>
            <h2 className='font-bold text-3xl'>Tell us about the problem</h2>
            <p className='mt-3 text-gray-500 text-xl'>Give us some details about the problem that will help us resolve it</p>

            <div className='mt-10 flex flex-col gap-8'>
                
                <div>
                    <h2 className='text-xl my-3 font-medium'>Problem Title</h2>
                    <Input placeholder='Insert the problem title' type="email" />
                </div>

                <div>
                    <h2 className='text-xl my-3 font-medium'>Problem Category</h2>
                    <Select>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                <SelectItem value="road & traffic">Road & Traffic</SelectItem>
                                <SelectItem value="public transportation">Public Transportation</SelectItem>
                                <SelectItem value="waste & cleanliness">Waste & Cleanliness</SelectItem>
                                <SelectItem value="water & sewage">Water & Sewage</SelectItem>
                                <SelectItem value="parks & public spaces">Parks & Public Spaces</SelectItem>
                                <SelectItem value="streetlights & electrical">Streetlights & Electrical</SelectItem>
                                <SelectItem value="public safety & security">Public Safety & Security</SelectItem>
                                <SelectItem value="noise & nuisance">Noise & Nuisance</SelectItem>
                                <SelectItem value="construction & infrastructure">Construction & Infrastructure</SelectItem>
                                <SelectItem value="private property & bylaw violations">Private Property & Bylaw Violations</SelectItem>
                                <SelectItem value="wildlife & animal control">Wildlife & Animal Control</SelectItem>
                                <SelectItem value="accessibility issues">Accessibility Issues</SelectItem>
                                <SelectItem value="other">Other</SelectItem>


                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <h2 className='text-xl my-3 font-medium'>Problem Description</h2>
                    <Textarea placeholder="Insert a description of the problem" />
                </div>

                <div>
                    <h2 className='text-xl my-3 font-medium'>Location of the problem</h2>
                    <GooglePlacesAutocomplete
                        apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                        selectProps={{
                            place,
                            onChange: (v) => { setPlace(v); console.log(v) }
                        }}
                    />
                </div>

            </div>
        </div>
    )
}

export default CreateReport