import React, { useState, useRef } from "react";
import axios from "axios";
import { FaArrowUpFromBracket, FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const Upload = ({ onScanComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            setFile(droppedFile);
        }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleUploadClick = () => fileInputRef.current.click();
    const handleRemove = () => {
        setFile(null);
        fileInputRef.current.value = null;
    };

 const resizeImage = (base64, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if(width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                if(width > height) {
                    width = maxWidth;
                    height = Math.round(maxWidth / aspectRatio);
                } else {
                    height = maxHeight;
                    width = Math.round(maxHeight * aspectRatio);
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = base64;
    });
 }

const scanReceipt = async() => {
    if(!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async() => {
        try {
            const resizedBase64 = await resizeImage(reader.result, 1024, 1024);
            const base64Image = resizedBase64.replace(/^data:image\/\w+;base64,/, "");

            console.log("Sending to backend...");

            const res = await axios.post(
                "http://localhost:3000/api/scan", 
                {
                    filename: file.name,
                    image: base64Image
                },
                { headers: { "Content-Type": "application/json"}}
            );

            console.log("Backend response:", res.data);
            onScanComplete(res.data);
            navigate("/receipt", { state: res.data});
        } catch (err) {
            console.error("Scan error:", err.response?.data || err.message);
            alert("Failed to scan reciept. Check console for details.");
        } finally {
            setLoading(false);
        }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="upload-content">
            <h1>Scan Receipt</h1>
            {!file && <p>Take a photo or upload an image of your receipt</p>}

            <div
                className='upload-box'
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                                               <button onClick={handleUploadClick}>
                            <FaArrowUpFromBracket size={20} className="upload" /> Upload Receipt
                        </button>
                        <p>Or</p>
                        <p>Drag and drop</p>

                    </>
                ) : (
                    <div className="preview">
                        <img src={URL.createObjectURL(file)} alt="receipt" />
{loading && (
    <>
        <div className="scanner-line"></div>
                    <div className="scan-overlay">
    <div className="spinner"></div>
    <span style={{background: 'whitesmoke'}}>Looking at receipt…</span>
</div>

    </>
     )} 



                        <button onClick={handleRemove} className="remove">
                            <FaXmark size={20} className="xmark" />
                        </button>
                    </div>
                )}

                <input
                    type='file'
                    accept='image/*'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleChange}
                />
            </div><br />

            {file && !loading && (
                <button onClick={scanReceipt} className="scan-btn">
                    Scan the Bill
                </button>
            )}
            {loading && <p>Scanning…</p>}

        </div>
    );
};

export default Upload;