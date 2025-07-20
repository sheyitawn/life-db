import React, { useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './relationships.css';

const AddRelationship = ({ onAdded }) => {
  const [form, setForm] = useState({
    name: '',
    birthday: '',
    checkin_freq: 'weekly',
    present: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/relationships/add', 'POST', form);
      onAdded && onAdded(); // Refresh list
      setForm({ name: '', birthday: '', checkin_freq: 'weekly', present: false});
    } catch (err) {
      console.error('Failed to add relationship:', err);
    }
  };

  return (
    <form className="relationship-form" onSubmit={handleSubmit}>
      <input name="name" autoComplete="off" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="birthday" autoComplete="off" placeholder="DD-MM" value={form.birthday} onChange={handleChange} required />
      <select name="checkin_freq" value={form.checkin_freq} onChange={handleChange}>
        <option value="weekly">Weekly</option>
        <option value="bi-weekly">Bi-weekly</option>
        <option value="monthly">Monthly</option>
        <option value="bi-monthly">Bi-monthly</option>
        <option value="half-yearly">Half-yearly</option>
        <option value="yearly">Yearly</option>
      </select>
      <label>
        <input type="checkbox" name="present" checked={form.present} onChange={handleChange} />
        Gets Present
      </label>
      {/* <label>
        <input type="checkbox" name="got_present" checked={form.got_present} onChange={handleChange} />
        Got Present
      </label> */}
      <button type="submit">Add</button>
    </form>
  );
};

export default AddRelationship;
