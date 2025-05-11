import React from 'react';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center min-h-[100px] w-full">
            <div
                className="
                    w-12 h-12                 /* Ширина та висота спінера */
                    border-4 border-gray-300  /* Колір рамки (прозорий) */
                    border-t-blue-500         /* Колір верхньої частини, що обертається */
                    rounded-full              /* Робить його круглим */
                    animate-spin              /* Застосовує вбудовану анімацію обертання Tailwind */
                "
            ></div>
        </div>
    );
};

export default Spinner;