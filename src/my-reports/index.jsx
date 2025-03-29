import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom';
import UserReportCardItem from './components/UserReportCardItem';

function MyReports() {

    const navigation = useNavigation();
    const [userReports, setUserReports] = useState([]);

    useEffect(() => {
        GetUserReports();
    }, [])

    /**
     * Used to get all user reports for a specific user
     * @returns 
     */
    const GetUserReports = async () => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            navigation('/');
            return;
        }

        const q = query(collection(db, 'Reports'), where('userEmail', '==', user?.email));
        const querySnapshot = await getDocs(q);
        setUserReports([]);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            setUserReports(prevVal => [...prevVal, doc.data()]);
        });
    }

    return (
        <div className='min-h-screen flex flex-col'>
            <div className='flex-1 px-10 pt-10'>
                <h2 className='font-bold text-3xl'>My Reports</h2>
                <p className='mt-3 text-gray-500 text-xl'>Click each problem for more information3</p>

                <div className='grid grid-cols-2 mt-10 md:grid-cols-3 gap-5'>
                    {userReports?.length > 0 ? userReports.map((report, index) => (
                        <UserReportCardItem report={report} key={index} />
                    ))
                        : [1, 2, 3, 4, 5, 6].map((item, index) => (
                            <div key={index} className='h-[132px] w-full bg-slate-200 animate-pulse rounded-lg'>

                            </div>
                        ))
                    }
                </div>
            </div>
            {/* Full-width footer */}
            <div className="w-full text-center text-gray-500 border-t pt-6 pb-6 mt-13">
                <p>Created by Group 42 • Cypress</p>
            </div>
        </div>
    )
}

export default MyReports