import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../state/language';
import { MultiSelect, MultiSelectOption } from '../../../shared/ui';
import { ConfirmPolitics } from '../shared/ConfirmPolitics';
import { PhoneNumber } from '../shared/PhoneNumber';
// import Error from "../../../components/Error/Error"; // Assuming Error component exists for displaying errors

import { useCategoriesQuery } from '../../../hooks/useCategoriesQuery';
import { useCities } from '../../../state/site-data';
import { useRegisterContractor } from '../../../state/user';
import styles from './RegistrationContractorPage.module.scss';
import sharedStyles from '../shared/RegistrationPage.module.scss';

const RegistrationContractorPage = () => {
  const text = useLanguage();
  const { categories } = useCategoriesQuery();
  const cities = useCities();
  const navigate = useNavigate();
  const registerContractorMutation = useRegisterContractor();

  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('+7(9');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [keep, setKeep] = useState(false);
  const [accept, setAccept] = useState(false);

  // Сброс ошибки телефона при изменении номера
  useEffect(() => {
    if (phone.replace(/\D/g, '').length === 11) {
      setError('');
    }
  }, [phone]);

  const [sectionOptionSelected, setSectionOptionSelected] = useState<MultiSelectOption[] | null>([]);
  const [subSectionOptionSelected, setSubSectionOptionSelected] = useState<MultiSelectOption[] | null>([]);
  const [serviceOptionSelected, setServiceOptionSelected] = useState<MultiSelectOption[] | null>([]);

  useEffect(() => {
    document.title = 'Регистрация мастера';
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!accept) {
      setError(
        'Чтобы продолжить необходимо принять политику конфиденциальности.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 11) {
      setError('Номер телефона введен не полностью.');
      return;
    }

    const uName = `${name.trim()} ${lastname.trim()}`.trim();
    if (!uName) { // Используем uName для проверки наличия имени и фамилии
      setError('Имя и Фамилия должны быть заполнены.');
      return;
    }

    try {
      await registerContractorMutation.register({
        name: name.trim(),
        lastname: lastname.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        locality: Number(city || 0),
        password,
        details: {
          address: address.trim(),
          //~ section: sectionOptionSelected?.map(opt => opt.value) || [],
          //~ subsection: subSectionOptionSelected?.map(opt => opt.value) || [],
          services: serviceOptionSelected?.map(opt => opt.value) || [],
          //~ subservice: subModelOptionSelected?.map(opt => opt.value) || [],
        },
        keepAuthorized: keep,
      });
      navigate("/");
    } catch (err: any) {
      console.error('Registration API error:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const sectionOptions: MultiSelectOption[] = categories.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const subSectionOptions: MultiSelectOption[] = categories.flatMap((i) => {
    const isSelectedSectionId = sectionOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedSectionId
      ? i.subsections.map((j) => ({ label: j.name, value: j.id }))
      : [];
  });

  const serviceOptions = categories.flatMap((i) => {
    const isSelectedSectionId = sectionOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedSectionId
      ? i.subsections.flatMap((j) => {
          const isSelectedSubSectionId = subSectionOptionSelected?.find(
            (item) => item.value === j.id,
          );
          const services = Array.isArray(j.services) ? j.services : [];
          return isSelectedSubSectionId
            ? services.map((c) => ({ label: c.name, value: c.id }))
            : [];
        })
      : [];
  });

  return (
      <div className={`${styles.registrationContractorPage}`}>
        <h1 className={styles.registrationContractorPage_title}>Регистрация</h1>
        <form
          className={styles.registrationContractorPage_form}
          onSubmit={onSubmit}
        >
          {error && (
            <div
              className="auth-err"
              style={{
                marginBottom: '10px',
                color: 'red',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <select
            className={styles.registrationContractorPage_form_input}
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          >
            <option value='' disabled>{text('Choose city...')}</option>
            {
              Object.entries(cities).map(([ id, name ]) =>
                <option key={id} value={id}>{name}</option>
              )
            }
          </select>
          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="address_form"
            placeholder="Адрес (улица, дом)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="name_form"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="lastname_form"
            placeholder="Фамилия"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
          <div className={styles.registrationContractorPage_input_phone_wrap}>
            <PhoneNumber
              placeholder="Телефон"
              className={`${styles.registrationContractorPage_form_input} ${
                phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
              }`}
              value={phone}
              onChange={setPhone}
            />
          </div>
          <input
            className={styles.registrationContractorPage_form_input}
            type="email"
            name="email_form"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="password"
            name="password_form"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="password"
            name="confirm_password_form"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <MultiSelect
            key="category_main_id"
            placeholder="Вид основной категории"
            options={sectionOptions}
            onChange={(selected: MultiSelectOption[] | null) => {
              setSectionOptionSelected(selected);
              setSubSectionOptionSelected([]); // Reset sub-categories
              setServiceOptionSelected([]); // Reset models
            }}
            value={sectionOptionSelected}
            isMulti={true} // Allow multiple main categories if needed
            menuPlacement={'bottom'}
          />
          {sectionOptionSelected &&
            sectionOptionSelected.length > 0 && (
              <MultiSelect
                key="categories_sub_id"
                placeholder="Подкатегории"
                options={subSectionOptions}
                onChange={(selected: MultiSelectOption[] | null) => {
                  setSubSectionOptionSelected(selected);
                  setServiceOptionSelected([]); // Reset models on sub-category change
                }}
                value={subSectionOptionSelected}
                isSelectAll={true}
                isMulti={true}
                menuPlacement={'bottom'}
                isDisabled={
                  !sectionOptionSelected ||
                  sectionOptionSelected.length === 0
                }
              />
            )}
          {subSectionOptionSelected && subSectionOptionSelected.length > 0 && (
            <MultiSelect
              key="model_phone_id"
              placeholder="Наименование услуги"
              options={serviceOptions}
              onChange={(selected: MultiSelectOption[] | null) =>
                setServiceOptionSelected(selected)
              }
              value={serviceOptionSelected}
              isSelectAll={true}
              isMulti={true}
              menuPlacement={'bottom'}
              isDisabled={
                !subSectionOptionSelected || subSectionOptionSelected.length === 0
              }
            />
          )}

          <div className={sharedStyles.registrationPage_checkbox_container}>
            <input
              id="keep-authorized"
              type="checkbox"
              onChange={(e) => setKeep(e.target.checked)}
            />
            <label htmlFor="keep-authorized">
               Оставаться в системе
            </label>
          </div>

          <ConfirmPolitics accept={accept} onChange={setAccept}/>

          <button
            className={styles.registrationContractorPage_form_button}
            type="submit"
            disabled={registerContractorMutation.isPending}
          >
            {registerContractorMutation.isPending ? text("Registering...") : text("Register")}
          </button>
        </form>
      </div>
  );
};

export default RegistrationContractorPage;
