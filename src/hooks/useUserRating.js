// src/hooks/useUserRating.js

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectUser } from '../slices/user.slice';
import appFetch from '../services/api';

export const useUserRating = () => {
  // Получаем ID пользователя из Redux
  const userData = useSelector(selectUser)?.data?.user;
  const user = userData ? Object.values(userData)[0] : {};
  const userId = user?.u_id;

  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    feedbackCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    // Не делаем запрос, если нет ID пользователя
    if (!userId) {
      setRatingData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchAndCalculateRating = async () => {
      try {
        // Запрашиваем архивные поездки, где пользователь был исполнителем
        const res = await appFetch('drive/archive', {
          body: { u_a_role: 2 }, // Запрашиваем как "Водитель" (Мастер)
        });

        const allBookings = Object.values(res?.data?.booking || {});

        // Фильтруем поездки, где текущий пользователь был водителем и есть оценка
        const userFeedback = allBookings.filter(
          (booking) =>
            booking.drivers?.some((driver) => driver.u_id === userId) &&
            booking.b_rating &&
            booking.b_options.type === 'order',
        );

        const feedbackCount = userFeedback.length;

        if (feedbackCount === 0) {
          setRatingData({
            averageRating: 0,
            feedbackCount: 0,
            isLoading: false,
          });
          return;
        }

        // Считаем средний рейтинг на основе b_rating
        const totalRatingSum = userFeedback.reduce(
          (sum, booking) => sum + (Number(booking.b_rating) || 0),
          0,
        );

        const averageRating = totalRatingSum / feedbackCount;

        setRatingData({
          averageRating: averageRating,
          feedbackCount: feedbackCount,
          isLoading: false,
        });
      } catch (err) {
        console.error('Ошибка при получении рейтинга пользователя:', err);
        setRatingData({ averageRating: 0, feedbackCount: 0, isLoading: false });
      }
    };

    fetchAndCalculateRating();
  }, [userId]); // Хук будет перезапускаться только если изменится ID пользователя

  return ratingData;
};
