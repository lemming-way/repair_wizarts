import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
import { updateUser } from '../../services/user.service';
import '../../scss/profile.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { selectUI } from '../../slices/ui.slice';
import MultiSelect from '../MultiSelect/MultiSelect';
import style from './Profile.module.css';
// {
//   "address": "csklncjksdncklsdncklsd",
//   "login": "sdcsdcsdjkcnsdsdncklsd",
//   "categories": {
//       "main": [
//           8
//       ],
//       "sub": [
//           228
//       ],
//       "models": [
//           13115,
//           13116,
//           13117,
//           13118,
//           13119
//       ]
//   }
// }
const EMPTY_OBJECT = {}
const experienceOptions = [
{ value: 1, label: '1 год' },
{ value: 2, label: '2 года' },
{ value: 3, label: '3 года' },
{ value: 5, label: '5 лет' },
{ value: 6, label: 'Более 5 лет' },
];

function Profile() {
  const [categoryMainOptionSelected, setCategoryMainOptionSelected] = useState(
    [],
  );
  const [experience, setExperience] = useState(null);

  //   const typeOfRepairOptions = [
  //     { value: 0, label: "Ремонт экрана" },
  //     { value: 1, label: "Замена батареи" },
  //     { value: 2, label: "Ремонт от воды" },
  //     { value: 3, label: "Прошивка устройства" },
  //     { value: 4, label: "Ремонт разъемов и портов" },
  //     { value: 5, label: "Восстановление программного обеспечения" },
  //   ]; ###

  const ui = useSelector(selectUI);
  const { categories } = useSelector((state) => state.categories);
  const user =
    Object.values(useSelector(selectUser)?.data?.user || EMPTY_OBJECT)[0] || EMPTY_OBJECT;
  const [Sections, setSections] = useState([]);
  const [Subsections, setSubsections] = useState([]);
  const [Services, setServices] = useState([]);
  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    u_description: '',
    details: {
      organization_name: '',
      address: '',
      specialty: '',
      main_business: '',
      experience: '',
      model: '',
      city: '',
    },
  });
  const [selectedSubsections, setSelectedSubsections] = useState(null);
  const [selectedServices, setSelectedServices] = useState(null);
  //~ const [gender, setGender] = useState('Мужской');
  const [business_model, setBusiness] = useState('Частный мастер');
  //~ const getData = async (type, sectionId, subsectionId, userDetails) => {
    //~ try {
      //~ switch (type) {
        //~ case 'section': {
          //~ const res = await fetch(
            //~ 'https://profiback.itest24.com/api/sections',
            //~ {
              //~ headers: {
                //~ 'Content-Type': 'application/json',
                //~ Authorization: 'Bearer 123',
              //~ },
            //~ },
          //~ );
          //~ const sections = await res.json();
          //~ console.log(sections);
          //~ setSections(
            //~ sections?.map((section) => ({
              //~ value: section.id,
              //~ label: section.name,
            //~ })),
          //~ );
          //~ if (userDetails) {
            //~ const currentSection = sections?.find(
              //~ (item) => item.id === userDetails?.section,
            //~ );
            //~ setCategoryMainOptionSelected(
              //~ currentSection
                //~ ? [{ value: currentSection.id, label: currentSection.name }]
                //~ : null,
            //~ );
          //~ }
          //~ break;
        //~ }
        //~ case 'subsection': {
          //~ const res = await fetch(
            //~ `https://profiback.itest24.com/api/subsections/?section_id=${sectionId}`,
            //~ {
              //~ headers: {
                //~ 'Content-Type': 'application/json',
                //~ Authorization: 'Bearer 123',
              //~ },
            //~ },
          //~ );
          //~ const subsections = await res.json();
          //~ console.log(subsections);

          //~ setSubsections([
            //~ ...subsections?.map((subsection) => ({
              //~ value: subsection.id,
              //~ label: subsection.name,
            //~ })),
          //~ ]);
          //~ if (userDetails) {
            //~ const currentSubsection = subsections?.find(
              //~ (item) => item.id === userDetails.subsection,
            //~ );
            //~ setSelectedSubsections(
              //~ currentSubsection
                //~ ? [
                    //~ {
                      //~ value: currentSubsection.id,
                      //~ label: currentSubsection.name,
                    //~ },
                  //~ ]
                //~ : null,
            //~ );
          //~ }
          //~ break;
        //~ }
        //~ case 'service': {
          //~ const res = await fetch(
            //~ `https://profiback.itest24.com/api/services/?subsection_id=${subsectionId}&section_id=${sectionId}`,
            //~ {
              //~ headers: {
                //~ 'Content-Type': 'application/json',
                //~ Authorization: 'Bearer 123',
              //~ },
            //~ },
          //~ );
          //~ console.log(subsectionId, sectionId);
          //~ const services = await res.json();
          //~ if (userDetails) {
            //~ const currentServices = services?.find(
              //~ (item) => item.id === userDetails.service,
            //~ );
            //~ setSelectedServices(
              //~ currentServices
                //~ ? [{ value: currentServices.id, label: currentServices.name }]
                //~ : null,
            //~ );
          //~ }
          //~ setServices([
            //~ ...services.map((service) => ({
              //~ value: service.id,
              //~ label: service.name,
            //~ })),
          //~ ]);

          //~ break;
        //~ }
        //~ default:
          //~ break;
      //~ }
    //~ } catch (error) {
      //~ console.error(error);
    //~ }
  //~ };

  const getFormAttrs = (field) => {
    const isNested = field.includes('.');

    const value = isNested
      ? field.split('.').reduce((obj, key) => obj?.[key], form)
      : form[field];

    const onChange = (e) => {
      const newValue = e.target.value;

      if (isNested) {
        const [first, second] = field.split('.');
        setForm((prev) => ({
          ...prev,
          [first]: {
            ...prev[first],
            [second]: newValue,
          },
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [field]: newValue,
        }));
      }
    };

    return {
      value,
      onChange,
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // const geo = await ymaps.geocode(form.address, { results: 1 });
    // const [address_latitude, address_longitude] = geo.geoObjects
    //   .get(0)
    //   .geometry.getCoordinates();
    const payload = {
      ...form,
      //~ gender,
      details: {
        ...form.details,
        business_model,
        section: categoryMainOptionSelected,
        subsection: selectedSubsections,
        service: selectedServices,
      },
    };
    try {
      await updateUser(payload, user.u_id).then((v) => console.log(v));
      setError('');
      setSuceeded(true);
    } catch (err) {
      setError(err.message);
      setSuceeded(false);
    }
  };

  useEffect(() => {
    if (!ui.isAuthorized) return;

    const master = user;

    const fetchAllData = async () => {
      if (
        master.u_details.section &&
        master.u_details.subsection &&
        master.u_details.service
      ) {
        setSubsections(
          categories.flatMap((item) => {
            const isSelectedSectionId = master.u_details.section.find(
              (selec) => selec.value === item.id,
            );
            return isSelectedSectionId
              ? item.subsections.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))
              : [];
          }),
        );
        setServices(
          categories.flatMap((item) => {
            const isSelectedSectionId = master.u_details.section.find(
              (selec) => selec.value == item.id,
            );
            return isSelectedSectionId
              ? item.subsections.flatMap((item) => {
                  const isSelectedSubsection = master.u_details.subsection.find(
                    (subSelec) => subSelec.value == item.id,
                  );
                  return isSelectedSubsection
                    ? item.services.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))
                    : [];
                })
              : [];
          }),
        );
        setCategoryMainOptionSelected(
          Array.isArray(master.u_details.section)
            ? master.u_details.section
            : [],
        );
        setSelectedSubsections(
          Array.isArray(master.u_details.subsection)
            ? master.u_details.subsection
            : [],
        );
        setSelectedServices(
          Array.isArray(master.u_details.service)
            ? master.u_details.service
            : [],
        );
      }
      // await getData('section', '', '', master.u_details);
      // await getData(
      //   'subsection',
      //   master.u_details?.section,
      //   '',
      //   master.u_details,
      // );
      // await getData(
      //   'service',
      //   master.u_details?.section,
      //   master.u_details?.subsection,
      //   master.u_details,
      // );
      setExperience(
        master.u_details?.experience
          ? [
              experienceOptions.find(
                (opt) => opt.value === master.u_details.experience,
              ),
            ]
          : null,
      );

      setForm({
        name: master.u_name,
        lastname: master.u_family,
        u_description: master.u_desc || '',
        details: {
          organization_name: master.u_details?.organization_name || '',
          address: master.u_details?.address || '',
          city: master.u_details?.city || '',
          specialty: master.u_details?.specialty || '',
          main_business: master.u_details?.main_business || '',
          experience: master.u_details?.experience || '',
        },
      });

      setBusiness(master.u_details?.business_model || 'Частный мастер');
    };
    if (
      master.u_details?.section &&
      master.u_details?.subsection &&
      master.u_details?.service
    ) {
      fetchAllData();
    }
  }, [ui.isAuthorized, categories, user]);

  useEffect(() => {
    document.title = 'Настройки';
    setSections(
      categories.map((item) => ({ label: item.name, value: item.id })),
    );
  }, [categories]);
  //   useEffect(() => {
  //     ymaps.ready(() => {
  //       const suggestView = new ymaps.SuggestView('suggest-input');
  //       suggestView.events.add('select', (e) => {
  //         setForm((prev) => ({
  //           ...prev,
  //           address: e.get('item').value,
  //         }));
  //       });
  //     });
  //   }, [ymaps]);
  return (
    <>
      <div className={`mini-main-2 df ${style.wrap_flex}`}>
        <form className="input-wrap-2" onSubmit={onSubmit}>
          {suceeded && (
            <div className="succeed-v">Данные успешно обновлены</div>
          )}
          {error && <div className="auth-err">{error}</div>}

          <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
            <MultiSelect
              key="category_id"
              placeholder="Вид категории"
              options={Array.isArray(Sections) ? Sections : []}
              isMulti={true}
              isSelectAll={true}
              onChange={(selected) => {
                setCategoryMainOptionSelected(selected);
                setSelectedSubsections(null);
                setSelectedServices(null);
                setSubsections(
                  categories.flatMap((item) => {
                    const isSelectedSectionId = selected.find(
                      (selec) => selec.value === item.id,
                    );
                    return isSelectedSectionId
                      ? item.subsections.map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))
                      : [];
                  }),
                );
              }}
              value={categoryMainOptionSelected}
              menuPlacement="bottom"
            />

            <MultiSelect
              key="subsection_id"
              placeholder="Подкатегории"
              isMulti={true}
              isSelectAll={true}
              options={Array.isArray(Subsections) ? Subsections : []}
              onChange={(selected) => {
                setSelectedSubsections(selected);
                setSelectedServices(null);
                setServices(
                  categories.flatMap((item) => {
                    const isSelectedSectionId = categoryMainOptionSelected.find(
                      (selec) => selec.value === item.id,
                    );
                    return isSelectedSectionId
                      ? item.subsections.flatMap((item) => {
                          const isSelectedSubsection = selected.find(
                            (subSelec) => subSelec.value === item.id,
                          );
                          return isSelectedSubsection
                            ? item.services.map((item) => ({
                                label: item.name,
                                value: item.id,
                              }))
                            : [];
                        })
                      : [];
                  }),
                );
              }}
              value={selectedSubsections}
              menuPlacement="bottom"
            />

            <MultiSelect
              key="services"
              isSelectAll={true}
              isMulti={true}
              placeholder="Услуги"
              options={Array.isArray(Services) ? Services : []}
              onChange={(selected) =>
                setSelectedServices(
                  Array.isArray(selected)
                    ? selected
                    : selected
                    ? [selected]
                    : [],
                )
              }
              value={selectedServices}
              menuPlacement="bottom"
            />
          </div>
          <input type="text" placeholder="Имя" {...getFormAttrs('name')} />

          <input
            type="text"
            placeholder="Фамилия"
            {...getFormAttrs('lastname')}
          />

          <input
            type="text"
            placeholder="Адрес"
            id="suggest-input"
            {...getFormAttrs('details.address')}
          />
          <input
            type="text"
            placeholder="Город"
            id="suggest-input"
            {...getFormAttrs('details.city')}
          />

          <input
            type="text"
            placeholder="Название организации"
            {...getFormAttrs('details.organization_name')}
          />

          <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
            <MultiSelect
              style={{ width: '100%' }}
              key="experience"
              placeholder="Опыт работы"
              options={experienceOptions}
              onChange={(selected) => {
                setExperience([selected]);
                setForm((prev) => ({
                  ...prev,
                  details: { ...prev.details, experience: selected.value },
                }));
              }}
              value={experience}
              isSelectAll={false}
              menuPlacement="bottom"
            />
          </div>

          <input
            type="text"
            placeholder="Основной бизнес"
            {...getFormAttrs('details.main_business')}
          />

          <input
            type="text"
            placeholder="Вид деятельности"
            {...getFormAttrs('details.specialty')}
          />

          <textarea
            placeholder={
              business_model === 'Частный мастер' ? 'О себе' : 'Об организации'
            }
            {...getFormAttrs('u_description')}
          />

          <div>
            <button type="submit" className="goooSaveButton">
              Сохранить
            </button>
          </div>
        </form>

        <div className={`check-input-content ${style.wrap_check}`}>
          {/* <div className="first-check">
                            <h4>Пол:</h4>
                            <div className="first_check df">
                                <input
                                    type="radio"
                                    name="select__man__woman"
                                    id="inputmanradiobtn"
                                    onChange={() => setGender("Мужской")}
                                    checked={gender === "Мужской"}
                                />
                                <label htmlFor="inputmanradiobtn"><p>Мужской</p></label>
                            </div>

                            <div className="first_check df">
                                <input
                                    type="radio"
                                    name="select__man__woman"
                                    id="inputwomanradiobtn"
                                    onChange={() => setGender("Женский")}
                                    checked={gender === "Женский"}
                                />
                                <label htmlFor="inputwomanradiobtn"><p>Женский</p> </label>
                            </div>
                        </div> */}

          <div className="second-check">
            <h4>Бизнес модель:</h4>
            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="yesornow"
                onChange={() => setBusiness('Частный мастер')}
                checked={business_model === 'Частный мастер'}
              />
              <label htmlFor="yesornow">
                <p>Частный мастер</p>
              </label>
            </div>

            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="inputradioservicebtn"
                onChange={() => setBusiness('Сервис')}
                checked={business_model === 'Сервис'}
              />
              <label htmlFor="inputradioservicebtn">
                <p>Сервис</p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
