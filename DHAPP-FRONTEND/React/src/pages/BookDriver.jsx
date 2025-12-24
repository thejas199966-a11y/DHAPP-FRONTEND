import React, { useState } from 'react';

export default function BookDriver() {
    const [formData, setFormData] = useState({
        driverName: '',
        date: '',
        time: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <div className="book-driver">
            <h1>Book Driver</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="driverName"
                    placeholder="Driver Name"
                    value={formData.driverName}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                />
                <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                />
                <button type="submit">Book Driver</button>
            </form>
        </div>
    );
}