import React, { useState, useEffect } from 'react';
import { FaChartPie, FaListAlt, FaFolderOpen } from 'react-icons/fa';
import { getWatchlist } from '../api/user'; // <--- ЗМІНЕНО: Імпортуємо getWatchlist з user.js

function UserStatistics() {
    const [statistics, setStatistics] = useState({
        totalItems: 0,
        statusBreakdown: {
            watching: 0,
            completed: 0,
            on_hold: 0,
            dropped: 0,
            plan_to_watch: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);

                // Використовуємо функцію getWatchlist з user.js
                const response = await getWatchlist(); // <--- Виклик функції getWatchlist
                const items = response.items;

                const newStatusBreakdown = {
                    watching: 0,
                    completed: 0,
                    on_hold: 0,
                    dropped: 0,
                    plan_to_watch: 0,
                };

                items.forEach(item => {
                    if (newStatusBreakdown[item.status] !== undefined) {
                        newStatusBreakdown[item.status]++;
                    }
                });

                setStatistics({
                    totalItems: items.length,
                    statusBreakdown: newStatusBreakdown,
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching user statistics:", err);
                setError('Не вдалося завантажити статистику. Спробуйте пізніше.');
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-[600px] h-[480px] bg-[#272727] p-6 rounded-[20px] text-white shadow-md mr-8 mt-[0.5px] flex items-center justify-center">
                Завантаження статистики...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[600px] h-[480px] bg-[#272727] p-6 rounded-[20px] text-red-500 shadow-md mr-8 mt-[0.5px] flex items-center justify-center">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="w-full max-w-[600px] h-[480px] bg-[#272727] p-6 rounded-[20px] text-white shadow-md mr-8 mt-[0.5px]">
            <h3 className="text-white font-bold text-4xl text-center mb-6">
                Ваша статистика
            </h3>

            <div className="mb-6">
                <div className="flex items-center gap-3 font-semibold text-2xl mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                        <FaListAlt className="text-black" />
                    </div>
                    <span className="text-white font-bold text-[20px]">
                        Загальна кількість елементів у списку:
                    </span>
                </div>
                <p className="text-lg ml-8">{statistics.totalItems}</p>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-3 font-semibold text-2xl mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                        <FaChartPie className="text-black" />
                    </div>
                    <span className="text-white font-bold text-[20px]">
                        Статус перегляду:
                    </span>
                </div>
                <ul className="list-disc list-inside ml-8 text-lg">
                    <li>Переглядаються: {statistics.statusBreakdown.watching}</li>
                    <li>Завершено: {statistics.statusBreakdown.completed}</li>
                    <li>Заплановано: {statistics.statusBreakdown.plan_to_watch}</li>
                    <li>На паузі: {statistics.statusBreakdown.on_hold}</li>
                    <li>Видалено/Закинуто: {statistics.statusBreakdown.dropped}</li>
                </ul>
            </div>
        </div>
    );
}

export default UserStatistics;