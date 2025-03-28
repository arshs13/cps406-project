import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

function Hero() {
    return (
        <div className='flex flex-col items-center mx-56 gap-9'>
            <h1 className='text-[#007dfc] font-extrabold text-[100px] text-center mt-15'>Welcome to Cypress</h1>
            <h2 className='font-semibold text-[40px] text-center'>
                Spot a problem? Report it in seconds with Cypress!
            </h2>
            <p className='font-light text-[30px] text-center text-gray-600 -mt-9'>
                Cypress is your go-to tool for reporting and tracking local issues in Toronto. Submit a report, stay updated, and help improve your community!
            </p>
            <h3 className='font-medium text-[23px] text-center'>
                Click "Create a Report" to get started.
            </h3>

            <Link to={'/create-report'}>
                <Button> Create Report </Button>
            </Link>
        </div>
    )
}

export default Hero