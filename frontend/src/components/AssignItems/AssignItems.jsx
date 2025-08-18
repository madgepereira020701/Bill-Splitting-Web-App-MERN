import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import './AssignItems.css';

const AssignItems = () => {
  const [inputs, setInputs] = useState([""]);
  const [totals, setTotals] = useState({});
  const [selected, setSelected] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const {items = []} = location.state || {};

  const handleAdd = () => {
    setInputs([...inputs, ""]);
  };

  const handleNavigate = () => {
    navigate('/splitsummary', { state: { totals, items, inputs, selected}});
  };

  const handleDelete = (index) => {
    const updatedInputs = inputs.filter((_, i) => i !== index);
    setInputs(updatedInputs);
  };

  const handleChange = (value, index) => {
    const updatedInputs = [...inputs];
    updatedInputs[index] = value;
    setInputs(updatedInputs);
  };

  const toggleAssignment = (productIndex, personName) => {
    setSelected(prev => {
      let updatedSelected = { ...prev};
      const isSelected = updatedSelected[productIndex]?.includes(personName);

      if(isSelected) {
        updatedSelected[productIndex] = updatedSelected[productIndex].filter(n => n!== personName);
      } else {
        updatedSelected[productIndex] = [...(updatedSelected[productIndex] || []), personName];
      }

      let newTotals = {};
      items.forEach((item, idx) => {
        const assignedPeople = updatedSelected[idx] || [];
        if(assignedPeople.length > 0) {
          const share = item.price / assignedPeople.length;
          assignedPeople.forEach(person => {
            newTotals[person] = (newTotals[person] || 0) + share;
          });
        }
      });
      setTotals(newTotals);
      return updatedSelected;
    });
  };


  return (
    <div className="assign-items">
      <h1>Assign Items</h1>
      <p>Add names and assign items.</p>

      {inputs.map((value, index) => (
        <div key={index} className="input-container">
          <div>
          <input
            type="text"
            value={value}
            placeholder="Person Name"
            className="input-group"
            onChange={(e) => handleChange(e.target.value, index)}
          />
          </div>
          <span>
          <button onClick={() => handleDelete(index)} className="delete">
            <FaTrash size={20} style={{marginRight: "100px"}}className="bin" />
          </button>
          </span>
        </div>
      ))}
    <br />

      <button onClick={handleAdd} className="add">
        <FaPlus size={20} className="plus" /> Add Person
      </button>

      <div style={{display: 'flex',flexDirection: 'row', gap:'170px'}}><h2>Assign Items</h2><span style={{backgroundColor: "white", padding: ' 0 10px', borderRadius:'5px'}}>Split evenly</span></div>
      <div>
        {items.map((item, index) => (
          <div key={index}>
            <div className="product">
              <div className="item">
                <span className="item-details">{item.item}</span>
                <span className="item-details"> ₹{item.price}</span>
              </div>

              <ul className="customers">
                {inputs.filter(name => name.trim() !== '').map((name, idx) => (
                  <button key={idx} onClick={() => toggleAssignment(index, name, item.price)} className={`person ${selected[index]?.includes(name) ? 'active' : ''}`}>{name}</button>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <button className="continue" onClick={handleNavigate}>
        Continue
      </button>
    </div>
  );
};

export default AssignItems;
