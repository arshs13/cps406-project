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
        <Link to={'/view-report/' + report?.reportId} className="block group">
            <div className='hover:bg-gray-50 hover:scale-105 transition-all border rounded-lg p-4 h-full flex flex-col justify-between'>
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h2 className='font-semibold text-gray-900 text-lg truncate'>{report?.title}</h2>
                    </div>
                    <p className='text-sm text-gray-500 mb-4'>
                        {formattedDate} • {formattedTime}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize 
                        ${report?.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                            report?.status === 'In-Progress' ? 'bg-yellow-100 text-yellow-800' :
                                report?.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                    report?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                        {report?.status}
                    </span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                        View details →
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default UserReportCardItem