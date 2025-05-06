import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Кольори для секторів графіку
const COLORS = ['#979797', '#626366'];

const data = [
  { name: "Фільми", value: 12 },
  { name: "Серіали", value: 18 },
];

const RatingPieChart = ({
  width = 425,
  height = 300,
  cx = '50%',
  cy = '50%',
  outerRadius = 90
}) => {
  return (
    <div className="bg-[#272727] p-7 rounded-2xl shadow-md text-white w-full max-w-[800px] mx-auto mt-[20px]">
      <h2 className="text-white font-bold text-3xl text-center mb-6">Оцінені типи контенту</h2>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        <PieChart width={width} height={height}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx={cx}
            cy={cy}
            outerRadius={outerRadius}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>

        <div className="text-left text-base">
          <h3 className="text-lg font-semibold mb-2">Опис:</h3>
          <ul className="list-disc list-inside space-y-1">
            {data.map((item, index) => (
              <li key={index}>
                <span style={{ color: COLORS[index % COLORS.length] }}>●</span>{' '}
                <span className="ml-1">
                  {item.name} — {item.value} оцінок
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RatingPieChart;
