import React, { useState, useEffect } from "react";
import './SplitSummary.css';
import { FaHome } from 'react-icons/fa';
import { useNavigate, useLocation } from "react-router-dom";
import { FaLeftLong, FaShare } from "react-icons/fa6";
import Confetti from 'react-confetti';

const SplitSummary = () => {
    const location = useLocation();
    const totals = location.state?.totals || [];
    const navigate = useNavigate();

    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight});

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight});
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    const handleNavigate = () => {
        navigate('/');
    };

    const handleBack = () => {
        navigate('/assignitems', { state: {
            items: location.state?.items || [],
            inputs: location.state?.inputs || [],
            selected: location.state?.selected || [],
        }});
    };

    return (
        <div className='splitsummary-page' style={{ position: "relative" }}>
            {/* 🎉 Confetti on top of content */}
        <Confetti 
           width= {windowSize.width} 
           height= {windowSize.height} 
           numberOfPieces={250}
           recycle={false}
           style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none", background: "transparent"}}  />

            {/* Page content */}
            <div className='splitsummary-content'>
                <p><FaLeftLong size={20} className="leftarrow" onClick={handleBack} />Back</p>
                <h1>Split Summary</h1>
                <p>Here is how you should split this bill:</p>

                <div className="split-container">
                    {Object.keys(totals).length === 0 ? (
                        <p>No people assigned.</p>
                    ) : (
                        Object.entries(totals).map(([person, amount], idx) => (
                            <div key={idx} className="splitsummary">
                                <span className="person-name">{person}</span>
                                <span className="person-amount">₹{amount}</span>
                            </div>
                        ))
                    )}
                </div>

                <br />
                <button className='share'><FaShare size={20} className="share-icon" />Share</button><br />
                <button className='backhome' onClick={handleNavigate}><FaHome size={20} className="home" />Back Home</button>
            </div>
        </div>
    );
};

export default SplitSummary;
