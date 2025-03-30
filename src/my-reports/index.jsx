import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigation } from 'react-router-dom';
import UserReportCardItem from './components/UserReportCardItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function MyReports() {

    const navigation = useNavigation();
    const [userReports, setUserReports] = useState([]);
    const [sortBy, setSortBy] = useState('dateDesc');

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

    const sortedReports = useMemo(() => {
        return [...userReports].sort((a,b) => {
            const dateA = new Date(a.createdAt?.seconds * 1000);
            const dateB = new Date(b.createdAt?.seconds * 1000);

            switch(sortBy) {
                case 'dateDesc':
                    return dateB - dateA;
                case 'dateAsc':
                    return dateA - dateB;
                case 'titleAsc':
                    return a.title.localeCompare(b.title);
                case 'titleDesc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }, [userReports, sortBy]);

    return (
        <div className='min-h-screen flex flex-col'>
            <div className='flex-1 px-10 pt-10'>
                <div className='flex justify-between items-center'>
                    <h2 className='font-bold text-3xl'>My Reports</h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='dateDesc'>Newest First</SelectItem>
                            <SelectItem value='dateAsc'>Oldest First</SelectItem>
                            <SelectItem value='titleAsc'>Title A-Z</SelectItem>
                            <SelectItem value='titleDesc'>Title Z-A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <p className='mt-3 text-gray-500 text-xl'>Click each problem for more information</p>

                <div className='grid grid-cols-2 mt-10 md:grid-cols-3 gap-5'>
                    {sortedReports?.length > 0 ? sortedReports.map((report, index) => (
                        <UserReportCardItem report={report} key={report.reportId || index} />
                    )) : ( 
                        [1, 2, 3, 4, 5, 6].map((item, index) => (
                            <div key={index} className='h-[132px] w-full bg-slate-200 animate-pulse rounded-lg' />
                        ))
                    )}
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