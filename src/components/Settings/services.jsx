import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../../scss/service.css';
import '../../scss/register-master.scss';
import { selectUser } from '../../slices/user.slice';
//~ import { getMasterRepairsByUsername } from '../../services/service.service';
import MultiSelect from '../MultiSelect/MultiSelect';

import style from './services.module.css';
import { updateUser } from '../../services/user.service';

const EMPTY_OBJECT = {}

function Services() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || EMPTY_OBJECT)[0] || EMPTY_OBJECT;
  const [categoryMainOptionSelected, setCategoryMainOptionSelected] =
    useState(null);
  const [categoryOptionSelected, setCategoryOptionSelected] = useState(null);
  const [brandOptionSelected, setBrandOptionSelected] = useState(null);
  const [modelPhoneOptionSelected, setModelPhoneOptionSelected] =
    useState(null);
  //~ const [repairs, setRepairs] = useState([]);
  const [servicesBlocks, setServicesBlocks] = useState({});
  const username = user.u_details?.login;
  const { categories } = useSelector((state) => state.categories);
  useEffect(() => {
    if (!username) return;
    if (
      user.u_details?.section &&
      user.u_details?.subsection &&
      user.u_details?.service &&
      user.u_details?.servicesBlocks
    ) {
      setCategoryMainOptionSelected(
        Array.isArray(user.u_details.section) ? user.u_details.section : [],
      );
      setCategoryOptionSelected(
        Array.isArray(user.u_details.subsection)
          ? user.u_details.subsection
          : [],
      );
      setModelPhoneOptionSelected(
        Array.isArray(user.u_details.service) ? user.u_details.service : [],
      );
      setBrandOptionSelected(
        Array.isArray(user.u_details.question) ? user.u_details.question : [],
      );
      setServicesBlocks({ ...user.u_details.servicesBlocks });
    }
    //~ getMasterRepairsByUsername(username).then(setRepairs);
  }, [user, username]);
  useEffect(() => {
    var obj = {};
    if (!brandOptionSelected) {
      return;
    }

    brandOptionSelected.forEach((object) => {
      servicesBlocks[object.label]
        ? (obj[object.label] = servicesBlocks[object.label])
        : (obj[object.label] = {
            open: false,
            select_state: '',
            row: [
              {
                heading: '',
                description: '',
                time: '',
                price: '',
              },
              {
                heading: '',
                description: '',
                time: '',
                price: '',
              },
              {
                heading: '',
                description: '',
                time: '',
                price: '',
              },
              {
                heading: '',
                description: '',
                time: '',
                price: '',
              },
            ],
          });
    });
    setServicesBlocks(obj);
  }, [brandOptionSelected, servicesBlocks]);
  function changeInputs(value, key, field, index) {
    setServicesBlocks((prev) => {
      const updated = { ...prev };
      updated[key] = {
        ...updated[key],
        row: updated[key].row.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      };
      return updated;
    });
  }

  function deleteRow(key, index) {
    setServicesBlocks((prev) => {
      const updated = { ...prev };
      updated[key] = {
        ...updated[key],
        row: updated[key].row.filter((_, i) => i !== index),
      };
      return updated;
    });
  }

  function addRow(key) {
    setServicesBlocks((prev) => {
      const updated = { ...prev };
      updated[key] = {
        ...updated[key],
        row: [
          ...updated[key].row,
          {
            heading: '',
            description: '',
            time: '',
            price: '',
          },
        ],
      };
      return updated;
    });
  }
  function openBlocks(key) {
    const obj = {
      ...servicesBlocks,
      [key]: {
        ...servicesBlocks[key],
        open: !servicesBlocks[key].open,
      },
    };

    setServicesBlocks(obj);
  }

  function handleSelect(e, key) {
    var obj = { ...servicesBlocks };
    obj[key]['select_state'] = e.target.value;

    if (e.target.value === 'Свои услуги') {
      return;
    }

    if (e.target.value === 'Услуги по умолчанию') {
      obj[key]['row'] = [
        {
          heading: 'Замена стекла',
          description: '',
          time: '2 дня',
          price: '4500',
        },
        {
          heading: 'Замена аккумулятора',
          description: '',
          time: '1 час',
          price: '3000',
        },
        {
          heading: 'Ремонт динамика',
          description: 'ремонт динамика',
          time: '3 часа',
          price: '1500',
        },
      ];
    }

    setServicesBlocks(obj);
  }
  function onSubmit(e) {
    e.preventDefault();
    updateUser(
      {
        details: {
          section: categoryMainOptionSelected || [],
          subsection: categoryOptionSelected || [],
          service: modelPhoneOptionSelected || [],
          question: brandOptionSelected || [],
          servicesBlocks: [],
        },
      },
      user.u_id,
    ).then((v) => console.log(v));
  }
  const categoriesMainOptions = categories.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const categoriesOptions =
    ( categoryMainOptionSelected?.length ?? 0 ) > 0
      ? categories.flatMap((item) => {
          const isSelectedSectionId = categoryMainOptionSelected?.find(
            (selec) => selec.value === item.id,
          );
          return isSelectedSectionId
            ? item.subsections.map((item) => ({
                label: item.name,
                value: item.id,
              }))
            : [];
        })
      : [];

  const modelPhoneOptions = categories.flatMap((i) => {
    const isSelectedCategoryId = categoryMainOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedCategoryId
      ? i.subsections.flatMap((j) => {
          const isSelectedSubCategoryId = categoryOptionSelected?.find(
            (item) => item.value === j.id,
          );
          return isSelectedSubCategoryId
            ? j.services.map((c) => ({ label: c.name, value: c.id }))
            : [];
        })
      : [];
  });
  const brandPhoneOptions = categories.flatMap((i) => {
    const isSelectedCategoryId = categoryMainOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedCategoryId
      ? i.subsections.flatMap((j) => {
          const isSelectedSubCategoryId = categoryOptionSelected?.find(
            (item) => item.value === j.id,
          );
          return isSelectedSubCategoryId
            ? j.services.flatMap((c) => {
                const isSelectedService = modelPhoneOptionSelected?.find(
                  (item) => item.value === c.id,
                );
                return isSelectedService
                  ? c.questions.map((b) => ({ label: b.text, value: b.number }))
                  : [];
              })
            : [];
        })
      : [];
  });

  return (
    <div className={style.services_wrap}>
      <div className={style.categories_block}>
        <div className={style.alert}>Данные сохранены</div>

        <MultiSelect
          placeholder="Вид категории"
          options={categoriesMainOptions}
          onChange={(selected) => {
            setCategoryMainOptionSelected(selected);
            setCategoryOptionSelected([]);
            setModelPhoneOptionSelected([]);
          }}
          value={categoryMainOptionSelected}
          isSelectAll={true}
          menuPlacement={'bottom'}
        />
        <MultiSelect
          placeholder="Категории"
          options={categoriesOptions}
          onChange={(selected) => {
            setCategoryOptionSelected(selected);
            setModelPhoneOptionSelected([]);
          }}
          value={categoryOptionSelected}
          isSelectAll={true}
          menuPlacement={'bottom'}
        />
        <MultiSelect
          placeholder="Модель устройства"
          options={modelPhoneOptions}
          onChange={(selected) => setModelPhoneOptionSelected(selected)}
          value={modelPhoneOptionSelected}
          isSelectAll={true}
          menuPlacement={'bottom'}
        />
        <MultiSelect
          key="brand_id"
          placeholder="Бренды"
          options={brandPhoneOptions}
          onChange={(selected) => setBrandOptionSelected(selected)}
          value={brandOptionSelected}
          isSelectAll={true}
          menuPlacement={'bottom'}
        />

        <div className={style.wrap_buttons}>
          <button className={style.button_save} onClick={onSubmit}>
            Сохранить
          </button>
        </div>
      </div>

      <div className={style.right_block}>
        {Object.keys(servicesBlocks).length > 0 ? (
          <h3 className={style.heading}>Вид ремонта</h3>
        ) : null}
        {servicesBlocks
          ? Object.keys(servicesBlocks).map((key) => (
              <div className={style.block_service}>
                <div className={style.block_service__row}>
                  <input
                    className={style.input_heading}
                    value={key}
                    type="text"
                  />
                  <button
                    className={style.btn}
                    style={{
                      rotate: servicesBlocks[key]['open'] ? '180deg' : '0deg',
                    }}
                    onClick={() => openBlocks(key)}
                  >
                    <img src="/img/bot_white.png" alt="" />
                  </button>
                </div>

                {servicesBlocks[key]['open'] ? (
                  <>
                    <select
                      className={style.block__select}
                      value={servicesBlocks[key]['select_state']}
                      onChange={(e) => handleSelect(e, key)}
                      name=""
                      id=""
                    >
                      <option value="" disabled>
                        Не выбрано
                      </option>
                      <option value="Услуги по умолчанию">
                        Услуги по умолчанию
                      </option>
                      <option value="Свои услуги">Свои услуги</option>
                    </select>

                    <div className={style.block_service__body}>
                      {servicesBlocks[key]['row'].map((obj, index) => (
                        <div
                          key={index}
                          className={style.block_service__body_row}
                        >
                          <input
                            className={style.input_body}
                            type="text"
                            value={obj['heading']}
                            onChange={(e) =>
                              changeInputs(
                                e.target.value,
                                key,
                                'heading',
                                index,
                              )
                            }
                            placeholder="заголовок"
                          />
                          <input
                            className={style.input_body}
                            type="text"
                            value={obj['description']}
                            onChange={(e) =>
                              changeInputs(
                                e.target.value,
                                key,
                                'description',
                                index,
                              )
                            }
                            placeholder="описание"
                          />
                          <input
                            className={style.input_body}
                            type="text"
                            value={obj['time']}
                            onChange={(e) =>
                              changeInputs(e.target.value, key, 'time', index)
                            }
                            placeholder="время"
                          />
                          <input
                            className={style.input_body}
                            type="text"
                            value={obj['price']}
                            onChange={(e) =>
                              changeInputs(e.target.value, key, 'price', index)
                            }
                            placeholder="цена"
                          />
                          <button className={style.btn}>
                            <img src="/img/pencil_white.png" alt="" />
                          </button>
                          <button
                            className={style.btn}
                            onClick={(e) => deleteRow(key, index)}
                          >
                            <img src="/img/delete_white.png" alt="" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={style.row_buttons}>
                      <button
                        className={style.btn_v2}
                        onClick={(e) => addRow(key)}
                      >
                        Добавить услугу
                      </button>
                      {/* <button className={style.btn_v2} onClick={(e)=> addRow(key)}>Добавить</button> */}
                    </div>
                  </>
                ) : null}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default Services;
