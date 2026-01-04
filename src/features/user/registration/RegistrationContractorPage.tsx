import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../state/language';
import { MultiSelect, MultiSelectOption } from '../../../shared/ui';
import { ConfirmPolitics } from '../shared/ConfirmPolitics';
import { PhoneNumber } from '../shared/PhoneNumber';
// import Error from "../../../components/Error/Error"; // Assuming Error component exists for displaying errors

import { useCities, useServices } from '../../../state/site-data';
import { useRegisterContractor } from '../../../state/user';
import styles from './RegistrationContractorPage.module.scss';
import sharedStyles from '../shared/RegistrationPage.module.scss';

const RegistrationContractorPage = () => {
  const text = useLanguage();
  const { categories, subcategories, services } = useServices();
  const { cities } = useCities();
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

  const [categoryOptionSelected, setCategoryOptionSelected] = useState<MultiSelectOption[]>([]);
  const [subcategoryOptionSelected, setSubcategoryOptionSelected] = useState<MultiSelectOption[]>([]);
  const [serviceOptionSelected, setServiceOptionSelected] = useState<MultiSelectOption[]>([]);

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
          //~ section: categoryOptionSelected?.map(opt => opt.value) || [],
          //~ subsection: subcategoryOptionSelected?.map(opt => opt.value) || [],
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

  const categoryOptions: MultiSelectOption[] = Object.entries(categories).map(([id, { name }]) => ({
    label: name,
    value: id
  }));

  const subcategoryOptions: MultiSelectOption[] = [];
  for (const { value: id } of categoryOptionSelected) {
    subcategoryOptions.push(...categories[id].subcategories.map(id => ({
      label: subcategories[id].name,
      value: id
    })));
  }

  const serviceOptions: MultiSelectOption[] = [];
  for (const { value: id } of subcategoryOptionSelected) {
    serviceOptions.push(...subcategories[id].services.map(id => ({
      label: services[id].name,
      value: id
    })));
  }

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
            options={categoryOptions}
            onChange={(selected: MultiSelectOption[] | null) => {
              setCategoryOptionSelected(selected || []);
              setSubcategoryOptionSelected([]); // Reset sub-categories
              setServiceOptionSelected([]); // Reset models
            }}
            value={categoryOptionSelected}
            isMulti={true} // Allow multiple main categories if needed
            menuPlacement={'bottom'}
          />
          {categoryOptionSelected.length > 0 && (
              <MultiSelect
                key="categories_sub_id"
                placeholder="Подкатегории"
                options={subcategoryOptions}
                onChange={(selected: MultiSelectOption[] | null) => {
                  setSubcategoryOptionSelected(selected || []);
                  setServiceOptionSelected([]); // Reset models on sub-category change
                }}
                value={subcategoryOptionSelected}
                isSelectAll={true}
                isMulti={true}
                menuPlacement={'bottom'}
                isDisabled={
                  !categoryOptionSelected ||
                  categoryOptionSelected.length === 0
                }
              />
            )}
          {subcategoryOptionSelected.length > 0 && (
            <MultiSelect
              key="model_phone_id"
              placeholder="Наименование услуги"
              options={serviceOptions}
              onChange={(selected: MultiSelectOption[] | null) =>
                setServiceOptionSelected(selected || [])
              }
              value={serviceOptionSelected}
              isSelectAll={true}
              isMulti={true}
              menuPlacement={'bottom'}
              isDisabled={
                !subcategoryOptionSelected || subcategoryOptionSelected.length === 0
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
