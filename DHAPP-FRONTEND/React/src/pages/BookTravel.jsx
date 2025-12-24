import React, { useState } from 'react';

export default function BookTravel() {
    const [formData, setFormData] = useState({
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Book travel:', formData);
    };

    return (
        <div className="book-travel-container">
            <h1>Book Your Travel</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    value={formData.destination}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="travelers"
                    min="1"
                    value={formData.travelers}
                    onChange={handleChange}
                />
                <button type="submit">Book Now</button>
            </form>
        </div>
    );
}