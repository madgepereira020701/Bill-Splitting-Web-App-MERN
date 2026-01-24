import React from "react";
import './HomePage.css';
import { FaCamera } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";


const HomePage = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/upload');
    }
    return (
<>  
<div className='homepage'>   
<h1>Scan. Tap. Split</h1>
<p>Upload the clear reciept, tap your items, see who owes what.</p>
<button className='scan' onClick={handleNavigate}><FaCamera size={20} className="camera"/>Scan Receipt</button><br />
</div>
</>);
}

export default HomePage;