import React, {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import './ReceiptDisplay.css';
import { FaTrash, FaPlus } from "react-icons/fa6";

const ReceiptData = ({ data }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialItems = data && data.items ? data.items : location.state?.items || [];
  const initialTotal =  data?.total || location.state?.total || 0;

  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [taxRate, setTaxRate] = useState(0);
  const [tip, setTip] = useState(0);

  const handleNavigate = () => {
    navigate('/assignitems', {state: {items}});
  }

  const handleAddItem = () => {
    setItems([...items, {item: "", price: 0}])
  }
  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    recalcTotal(updatedItems);
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = items.map((it, i) => i === index ? { ...it, [field]: field === 'price' ? parseFloat(value) || 0: value} : it);
    setItems(updatedItems);
    recalcTotal(updatedItems);
  };

  const recalcTotal = (list) => {
    const newtotal = list.reduce((sum, it) => sum + (parseFloat(it.price) || 0),0)
    setTotal(newtotal);
  }

  if(!items || items.length === 0) return <p>No receipt data found</p>

  const taxAmount = (total * taxRate) / 100;
  const grandTotal = total + taxAmount + parseFloat(tip || 0);

  return (
    <div className="receipt-output">
        <h2>Receipt Items</h2>
        <p>List all the items on your receipt.</p>
        <ul style={{display: "flex", flexDirection: "column"}}>
            {items.map((item, i) => (
                <li key={i} className="list-items">
                <input type="text" value={item.item} className='item-item' onChange={(e) => handleItemChange(i, "item", e.target.value)}
                //readOnly={i < initialItems.length} 
                />
                <span className="currency"> ₹ </span>
                <input type="text" className='item-price'  onChange={(e) => handleItemChange(i, "price", e.target.value)} value={item.price}  
                //readOnly={i < initialItems.length}
                />
                <button className="item-delete" onClick={() => handleDeleteItem(i)}><FaTrash className="bin" style={{position: 'absolute', marginRight: '600px' }}/></button>
            </li>
            ))} 
        </ul>

              <button className="add-item" onClick={handleAddItem}>
                <FaPlus size={20} className="plus" /> Add Item
              </button><br/><br/>
        

        <div className="tip-tax">
        <div className="tip-tax-field">
            <label>Tip:</label>
            <input type="number"  value={tip} className="tip-value" onChange={(e) => setTip(e.target.value)}/>
        </div>
                <span className="tip-tax-field">
            <label>Tax%:</label>
            <input type="number"  value={taxRate} className="taxrate-value" onChange={(e) => setTaxRate(e.target.value)}/>
        </span>
        </div>
        <br />
        <p>Tax Amount: ₹{taxAmount.toFixed(2)}</p>
        <p>Grand Total: ₹{grandTotal.toFixed(2)}</p>

        <button onClick={handleNavigate} className="continue" style={{ marginTop: "10px"}}>Continue</button>
    </div>
  );

}

export default ReceiptData;