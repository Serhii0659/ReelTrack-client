import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";

export default function AddDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закриття меню при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 transition"
        title="Додати"
        aria-expanded={isOpen}
      >
        <Plus className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
          role="menu"
        >
          <ul className="py-1">
            <li role="menuitem">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                ➕ Додати фільм
              </button>
            </li>
            <li role="menuitem">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                📺 Додати серіал
              </button>
            </li>
            <li role="menuitem">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                🎨 Додати мультфільм
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}