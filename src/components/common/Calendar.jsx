import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';
/**
 * Simple Calendar Component
 * For date selection
 */
const Calendar = ({ selectedDate, onDateSelect, minDate = null, maxDate = null }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === new Date(selectedDate).toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date) => {
    if (!date || isDateDisabled(date)) return;
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-700 dark:text-gray-200 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const todayDate = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${disabled
                  ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : selected
                  ? 'bg-blue-600 text-gray-800 dark:text-gray-100'
                  : todayDate
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

