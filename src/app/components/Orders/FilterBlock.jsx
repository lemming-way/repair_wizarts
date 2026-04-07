import { useMemo } from 'react';

import style from './Allorders.module.css';
import { useOfferings } from '../../state/site-data';
import { useUser } from '../../state/user';

// Принимаем все состояния и сеттеры как props из родительского компонента
// todo: оставлять только категории, релевантные для мастера
export default function FilterBlock({
  categoryFilter,
  setCategoryFilter,
  offersCountFilter,
  setOffersCountFilter,
  budgetFilter,
  setBudgetFilter,
  customPriceRange,
  setCustomPriceRange,
}) {
  const { categories: allCategories, subcategories: allSubcategories, offerings: allOfferings } = useOfferings();
  const { user } = useUser();

  const { categories, subcategories, offerings } = useMemo(() => {
    const offerings = {};
    for (const id of Object.keys(user.services || {})) {
      if (allOfferings[id]) offerings[id] = allOfferings[id];
    }

    const subcategoryIds = [...new Set(Object.values(offerings).map(offering => offering.parent))];
    const subcategories = {};
    for (const id of subcategoryIds) {
      if (allSubcategories[id]) subcategories[id] = allSubcategories[id];
    }

    const categoryIds = [...new Set(Object.values(subcategories).map(subcategory => subcategory.parent))];
    const categories = {};
    for (const id of categoryIds) {
      if (allCategories[id]) categories[id] = allCategories[id];
    }

    return { categories, subcategories, offerings };
  }, [ user.services, allCategories, allSubcategories, allOfferings ]);

  // Универсальный обработчик для чекбоксов, которые управляют массивами (бюджет, предложения)
  const handleArrayFilterChange = (setter, currentArray, value) => {
    const valueString = JSON.stringify(value);
    const isChecked = currentArray.some(
      (item) => JSON.stringify(item) === valueString,
    );

    if (isChecked) {
      setter(
        currentArray.filter((item) => JSON.stringify(item) !== valueString),
      );
    } else {
      setter([...currentArray, value]);
    }
  };

  // Хелпер, чтобы определить, активен ли чекбокс
  const isRangeChecked = (currentArray, value) => {
    const valueString = JSON.stringify(value);
    return currentArray.some((item) => JSON.stringify(item) === valueString);
  };

  // Функция для сброса всех фильтров
  const resetFilters = () => {
    setCategoryFilter(null);
    setOffersCountFilter([]);
    setBudgetFilter([]);
    setCustomPriceRange({ min: '', max: '' });
  };

  return (
    <>
      <div className={style.filter_block}>
        <p
          className={style.filter__heading}
          style={{ cursor: 'pointer' }}
          onClick={() => setCategoryFilter(null)} // Сброс фильтра по клику на заголовок
        >
          Рубрики
        </p>
        {Object.entries(categories).map(([categoryId, category]) => (
          <details key={categoryId} className={style.margin_btm}>
            {/*
              По клику на summary устанавливается фильтр по этой категории.
              Добавляем класс для подсветки активной категории.
            */}
            <summary
              className={`${style.filter__summary} ${
                categoryFilter === categoryId ? style.active_category : ''
              }`}
              onClick={(e) => {
                // Предотвращаем стандартное открытие/закрытие details, если нам это не нужно,
                // или оставляем, если внутри есть полезный контент.
                // e.preventDefault();
                setCategoryFilter(categoryId);
              }}
            >
              {category.name}
            </summary>
            {/* Вложенные детали, если они нужны для навигации, но не для фильтрации */}
            <div className={style.filter__details_data}>
              {category.subcategories.map(subId => {
                const sub = subcategories[subId];
                if (!sub) return null;

                return (
                  <details key={subId}>
                    <summary>{sub.name}</summary>
                    <div className={style.filter__details_data}>
                      {sub.offerings.map(offeringId =>
                        offerings[offeringId] ?
                        <details key={offeringId}>
                          <summary>{offerings[offeringId].name}</summary>
                        </details> :
                        null
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </details>
        ))}

        <p className={style.filter__heading}>Количество предложений</p>
        <div className={style.margin_btm}>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="offers_check_1"
              checked={isRangeChecked(offersCountFilter, [0, 5])}
              onChange={() =>
                handleArrayFilterChange(
                  setOffersCountFilter,
                  offersCountFilter,
                  [0, 5],
                )
              }
            />
            <label htmlFor="offers_check_1">До 5</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="offers_check_2"
              checked={isRangeChecked(offersCountFilter, [5, 10])}
              onChange={() =>
                handleArrayFilterChange(
                  setOffersCountFilter,
                  offersCountFilter,
                  [5, 10],
                )
              }
            />
            <label htmlFor="offers_check_2">От 5 до 10</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="offers_check_3"
              checked={isRangeChecked(offersCountFilter, [10, 15])}
              onChange={() =>
                handleArrayFilterChange(
                  setOffersCountFilter,
                  offersCountFilter,
                  [10, 15],
                )
              }
            />
            <label htmlFor="offers_check_3">От 10 до 15</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="offers_check_4"
              checked={isRangeChecked(offersCountFilter, [15, 20])}
              onChange={() =>
                handleArrayFilterChange(
                  setOffersCountFilter,
                  offersCountFilter,
                  [15, 20],
                )
              }
            />
            <label htmlFor="offers_check_4">От 15 до 20</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="offers_check_5"
              checked={isRangeChecked(offersCountFilter, [20, null])}
              onChange={() =>
                handleArrayFilterChange(
                  setOffersCountFilter,
                  offersCountFilter,
                  [20, null],
                )
              }
            />
            <label htmlFor="offers_check_5">От 20</label>
          </div>
        </div>

        <p className={style.filter__heading}>Бюджет</p>
        <div className={style.margin_btm}>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="check_price_1"
              checked={isRangeChecked(budgetFilter, [0, 1000])}
              onChange={() =>
                handleArrayFilterChange(
                  setBudgetFilter,
                  budgetFilter,
                  [0, 1000],
                )
              }
            />
            <label htmlFor="check_price_1">До 1000 ₽</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="check_price_2"
              checked={isRangeChecked(budgetFilter, [1000, 3000])}
              onChange={() =>
                handleArrayFilterChange(
                  setBudgetFilter,
                  budgetFilter,
                  [1000, 3000],
                )
              }
            />
            <label htmlFor="check_price_2">От 1000 до 3000 ₽</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="check_price_3"
              checked={isRangeChecked(budgetFilter, [3000, 10000])}
              onChange={() =>
                handleArrayFilterChange(
                  setBudgetFilter,
                  budgetFilter,
                  [3000, 10000],
                )
              }
            />
            <label htmlFor="check_price_3">От 3000 до 10000 ₽</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="check_price_4"
              checked={isRangeChecked(budgetFilter, [10000, 30000])}
              onChange={() =>
                handleArrayFilterChange(
                  setBudgetFilter,
                  budgetFilter,
                  [10000, 30000],
                )
              }
            />
            <label htmlFor="check_price_4">От 10000 до 30000 ₽</label>
          </div>
          <div className={style.filter__row}>
            <input
              type="checkbox"
              id="check_price_5"
              checked={isRangeChecked(budgetFilter, [30000, null])}
              onChange={() =>
                handleArrayFilterChange(setBudgetFilter, budgetFilter, [
                  30000,
                  null,
                ])
              }
            />
            <label htmlFor="check_price_5">От 30000 ₽</label>
          </div>
        </div>

        <p className={style.filter__heading}>Свой диапазон бюджета</p>
        <div className={style.inputs_row}>
          <input
            className={style.input_price}
            type="number"
            placeholder="От, ₽"
            value={customPriceRange.min}
            onChange={(e) =>
              setCustomPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
          />
          <input
            className={style.input_price}
            type="number"
            placeholder="До, ₽"
            value={customPriceRange.max}
            onChange={(e) =>
              setCustomPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
          />
        </div>

        <button className={style.reset_button} onClick={resetFilters}>
          Сбросить все фильтры
        </button>
      </div>
    </>
  );
}
