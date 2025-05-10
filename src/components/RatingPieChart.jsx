// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\RatingPieChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RatingPieChart = ({ rating, size = 100, showTooltip = false }) => {
    // Рейтинг від 0 до 10, нам потрібно масштабувати його до відсотка
    const percentage = (rating / 10) * 100;
    const remaining = 100 - percentage;

    const data = [
        { name: 'Рейтинг', value: percentage },
        { name: 'Залишок', value: remaining }
    ];

    const COLORS = [
        rating >= 7 ? '#4CAF50' : // Зелений для високих рейтингів
        rating >= 5 ? '#FFC107' : // Помаранчевий для середніх
        '#F44336', // Червоний для низьких
        '#374151' // Сірий для залишкової частини
    ];

    return (
        <div style={{ width: size, height: size }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={size * 0.3} // Внутрішній радіус кільця
                        outerRadius={size * 0.45} // Зовнішній радіус кільця
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90} // Початок зверху
                        endAngle={90 + (360 * percentage / 100)} // Заповнення за годинниковою стрілкою
                        isAnimationActive={false} // Вимкнути анімацію, якщо вона заважає
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    {showTooltip && <Tooltip />}
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-white font-bold"
                        style={{ fontSize: size * 0.25 }} // Розмір тексту залежить від розміру діаграми
                    >
                        {rating ? rating.toFixed(1) : 'N/A'}
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RatingPieChart;