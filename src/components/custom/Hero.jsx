import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import LiveMap from './LiveMap'

function Hero() {
    return (
        <div className='min-h-screen flex flex-col'>
            <div className='flex flex-col items-center mx-56 gap-7 flex-1'>
                <h1 className='text-[#007dfc] font-extrabold text-[64px] text-center mt-11'>Welcome to Cypress</h1>
                <h2 className='font-semibold text-[30px] text-center'>
                    Spot a problem? Report it in seconds with Cypress!
                </h2>
                <p className='font-light text-[20px] text-center text-gray-600 -mt-2'>
                    Cypress is your go-to tool for reporting and tracking local issues in Toronto. Submit a report, stay updated, and help improve your community!
                </p>
                <h3 className='font-medium text-[18px] text-center mt-3'>
                    Click "Create a Report" to get started.
                </h3>

                <Link to={'/create-report'}>
                    <Button
                        size='lg'
                        className="text-lg cursor-pointer"
                    > Create Report </Button>
                </Link>
            </div>

            {/* Live Map Section */}
            <div className='px-10 mt-10 mb-10 flex-1 text-center flex flex-col items-center'>
                <h2 className='font-bold text-[32px] mb-4'>Live Map of All Problems</h2>
                <p className='text-gray-600 mb-6 max-w-3xl text-[18px]'>
                    Explore reported issues around Toronto. Click on markers to see details about each report.
                </p>
                <div className="w-full">
                    <LiveMap />
                </div>
            </div>

            {/* Footer added here */}
            <div className="mt-13 w-full text-center text-gray-500 border-t pt-6 pb-6">
                <p>Created by Group 10 • Cypress</p>
            </div>
        </div>
    )
}

export default Hero