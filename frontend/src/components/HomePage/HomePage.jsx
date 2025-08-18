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
<p>Snap the reciept, tap your items, see who owes what. No sign-ups, no math, no drama</p>
<button className='scan' onClick={handleNavigate}><FaCamera size={20} className="camera"/>Scan Receipt</button><br />
<button className='manual'>Enter Manually</button>
</div>
</>);
}

export default HomePage;