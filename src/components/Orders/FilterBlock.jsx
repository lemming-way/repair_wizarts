import { useSelector } from 'react-redux';
import style from './Allorders.module.css';

export default function FilterBlock() {
  const { categories } = useSelector((state) => state.categories);
  return (
    <>
      <div className={style.filter_block}>
        <p className={style.filter__heading}>Рубрики</p>
        {categories?.map((category) => (
          <details key={category.id} className={style.margin_btm}>
            <summary className={style.filter__summary}>{category.name}</summary>
            <div className={style.filter__details_data}>
              {category.subsections?.map((sub) => (
                <details key={sub.id}>
                  <summary>{sub.name}</summary>
                  <div className={style.filter__details_data}>
                    {sub.services?.map((service) => (
                      <details key={service.id}>
                        <summary>{service.name}</summary>
                        <div className={style.filter__details_data}>
                          {service.questions?.map((q) => (
                            <p key={q.number}>{q.text}</p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}

        <p className={style.filter__heading}>Колличество предложений </p>
        <div className={style.margin_btm}>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_1" />
            <label htmlFor="check_1">До 5 (34)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_2" />
            <label htmlFor="check_2">От 5 До 10 (34)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_3" />
            <label htmlFor="check_3">От 10 До 15 (34)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_4" />
            <label htmlFor="check_4">От 15 До 20 (34)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_5" />
            <label htmlFor="check_5">От 20 (34)</label>
          </div>
        </div>

        <p className={style.filter__heading}>Бюджет</p>
        <div className={style.margin_btm}>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_price_1" />
            <label htmlFor="check_price_1">До 1000 (21)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_price_2" />
            <label htmlFor="check_price_2">От 1000 До 3000 (11)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_price_3" />
            <label htmlFor="check_price_3">От 3000 До 10000 (40)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_price_4" />
            <label htmlFor="check_price_4">От 10000 До 30000 (13)</label>
          </div>
          <div className={style.filter__row}>
            <input type="checkbox" id="check_price_5" />
            <label htmlFor="check_price_5">От 30000 (10)</label>
          </div>
        </div>
        <div className={style.inputs_row}>
          <input
            className={style.input_price}
            type="text"
            placeholder="От руб"
          />
          <input
            className={style.input_price}
            type="text"
            placeholder="До руб"
          />
        </div>
      </div>
    </>
  );
}
