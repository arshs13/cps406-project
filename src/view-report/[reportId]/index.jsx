import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import Summary from '../components/Summary';

function ViewReport() {

    const {reportId}=useParams();
    const [report,setReport]=useState([]);

    useEffect(()=>{
        reportId&&GetReportData();
    },[reportId])

    /**
     * Used to get report information from Firebase
     */
    const GetReportData=async()=>{
        const docRef=doc(db,'Reports',reportId);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            console.log("Document:",docSnap.data());
            setReport(docSnap.data());
        }
        else{
            console.log("No Such Document");
            toast.error('No Report Found!');
        }
    }

  return (
    <div>
        {/* Report Summary  */}
        <Summary report={report} />

        {/* Footer  */}
    </div>
  )
}

export default ViewReport