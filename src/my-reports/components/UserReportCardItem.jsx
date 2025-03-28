import React from 'react'
import { Link } from 'react-router-dom';

function UserReportCardItem({ report }) {

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

    return (
        <Link to={'/view-report/'+report?.reportId}>
            <div className='hover:scale-105 transition-all'>
                <img src='/vite.svg'
                    className='object-cover rounded-xl' />
                <div>
                    <h2 className='font-bold text-lg'>{report?.title}</h2>
                    <h2>{formattedDate} at {formattedTime}</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${report?.status === 'In-Progess' ? 'bg-yellow-100 text-yellow-800' :
                        report?.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'}`}>
                    {report?.status}
                </span>
            </div>
        </Link>
    )
}

export default UserReportCardItem