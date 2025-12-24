import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiTag } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';
/**
 * Event Card Component
 */
const EventCard = ({ event }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || '';
  };

  const getCategoryColor = (category) => {
    const colors = {
      conference: 'bg-blue-100 text-blue-800',
      workshop: 'bg-accent-100 text-accent-800',
      social: 'bg-green-100 text-green-800',
      sports: 'bg-orange-100 text-orange-800',
      default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
    };
    return colors[category] || colors.default;
  };

  const remainingSpots = event.capacity - event.registered_count;
  const isFull = remainingSpots <= 0;
  const isPaid = event.is_paid && event.price > 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="card hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{event.description}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
            event.category
          )}`}
        >
          <FiTag className="inline mr-1" />
          {event.category}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <FiCalendar className="mr-2" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <FiClock className="mr-2" />
          {formatTime(event.start_time)} - {formatTime(event.end_time)}
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <FiMapPin className="mr-2" />
          {event.location}
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <FiUsers className="mr-2" />
          {event.registered_count}/{event.capacity} kayıtlı
          {isFull && <span className="ml-2 text-red-600 font-medium">(Dolu)</span>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {isPaid ? (
          <span className="text-lg font-bold text-green-600">
            {event.price} TRY
          </span>
        ) : (
          <span className="text-sm text-green-600 font-medium">Ücretsiz</span>
        )}
        <span className="text-sm text-blue-600 group-hover:underline">
          Detayları Gör →
        </span>
      </div>
    </Link>
  );
};

export default EventCard;

