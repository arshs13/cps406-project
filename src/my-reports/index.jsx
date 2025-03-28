import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom';
import UserReportCardItem from './components/UserReportCardItem';

function MyReports() {

    const navigation = useNavigation();
    const [userReports,setUserReports]=useState([]);

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
            setUserReports(prevVal=>[...prevVal,doc.data()]);
        });
    }

    return (
        <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
            <h2 className='font-bold text-3xl'>My Reports</h2>

            <div className='grid grid-cols-2 mt-10 md:grid-cols-3 gap-5'>
                {userReports?.length>0?userReports.map((report,index)=>(
                    <UserReportCardItem report={report} key={index} />
                ))
                :[1,2,3,4,5,6].map((item,index)=>(
                    <div key={index} className='h-[200px] w-full bg-slate-200 animate-pulse rounded-xl'>

                    </div>
                ))
            }
            </div>
        </div>
    )
}

export default MyReports