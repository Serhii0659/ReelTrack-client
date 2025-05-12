// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\UserStatistics.jsx
import React, { useState, useEffect } from 'react';
import { FaChartPie, FaListAlt, FaFolderOpen } from 'react-icons/fa';
import { getWatchlist } from '../api/user';

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

                const response = await getWatchlist();
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
            <div className="w-full max-w-[600px] h-[410px] bg-[#272727] p-6 rounded-[20px] text-white shadow-md mt-[35px] flex items-center justify-center">
                Завантаження статистики...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[600px] h-[410px] bg-[#272727] p-6 rounded-[20px] text-red-500 shadow-md mt-[35px] flex items-center justify-center">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="w-full max-w-[600px] h-[410px] bg-[#272727] p-6 rounded-[20px] text-white shadow-md mt-[35px]">
            <h3 className="text-white font-bold text-4xl text-center mb-6">
                Ваша статистика
            </h3>

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center flex-shrink-0">
                        <FaListAlt className="text-black text-xl" />
                    </div>
                    <span className="text-white font-bold text-lg flex-1 min-w-0">
                        Загальна кількість елементів у списку:
                        <span className="ml-2 font-normal">{statistics.totalItems}</span>
                    </span>
                </div>
                {/* ВИДАЛЕНО: Тег <p> для кількості був тут, тепер він не потрібен */}
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center flex-shrink-0">
                       <FaChartPie className="text-black text-xl" />
                    </div>
                    {/* ЗМІНЕНО ТУТ: Розмір шрифту на text-lg (18px) для консистентності */}
                    <span className="text-white font-bold text-lg flex-1 min-w-0">
                        Статус перегляду:
                    </span>
                </div>
                {/* ВИПРАВЛЕНО: pl-12 для правильного відступу списку */}
                <ul className="list-disc list-inside text-lg pl-12">
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