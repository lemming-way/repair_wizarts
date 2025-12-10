import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './RegistrationContractorPage.module.scss';
import ConfirmPolitics from '../../../components/ConfirmPolitics/ConfirmPolitics';
import { ConfirmPoliticsContext } from '../../../components/ConfirmPolitics/ConfirmPoliticsContext';
import type { Option } from '../../../components/MultiSelect/MultiSelect';
import MultiSelect from '../../../components/MultiSelect/MultiSelect';
import { PhoneNumber } from '../PhoneNumber';
// import Error from "../../../components/Error/Error"; // Assuming Error component exists for displaying errors

import { useCategoriesQuery } from '../../../hooks/useCategoriesQuery';
import { useRegisterContractor } from '../../../state/user';

const RegistrationContractorPage = () => {
  const { categories } = useCategoriesQuery();
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

  const { accept, setAccept } = useContext(ConfirmPoliticsContext);

  // Сброс ошибки телефона при изменении номера
  useEffect(() => {
    if (phone.replace(/\D/g, '').length === 11) {
      setError('');
    }
  }, [phone]);

  const [categoryMainOptionSelected, setCategoryMainOptionSelected] = useState<
    Option[] | null
  >([]);
  const [categoryOptionSelected, setCategoryOptionSelected] = useState<
    Option[] | null
  >([]);
  const [modelPhoneOptionSelected, setModelPhoneOptionSelected] = useState<
    Option[] | null
  >([]);
  const [subModelOptionSelected, setSubModelOptionSelected] = useState<
    Option[] | null
  >([]);

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
      await registerContractorMutation.mutateAsync({
        name: name.trim(),
        lastname: lastname.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        password,
        details: {
          address: address.trim(),
          city: city.trim(),
          section: categoryMainOptionSelected?.map(opt => opt.value) || [],
          subsection: categoryOptionSelected?.map(opt => opt.value) || [],
          service: modelPhoneOptionSelected?.map(opt => opt.value) || [],
          subservice: subModelOptionSelected?.map(opt => opt.value) || [],
        },
        keepAuthorized: keep,
      });
      navigate("/");
    } catch (err: any) {
      console.error('Registration API error:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  console.log(categories);
  const categoriesMainOptions: Option[] = categories.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const categoriesOptions: Option[] = categories.flatMap((i) => {
    const isSelectedCategoryId = categoryMainOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedCategoryId
      ? i.subsections.map((j) => ({ label: j.name, value: j.id }))
      : [];
  });

  const modelPhoneOptions = categories.flatMap((i) => {
    const isSelectedCategoryId = categoryMainOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedCategoryId
      ? i.subsections.flatMap((j) => {
          const isSelectedSubCategoryId = categoryOptionSelected?.find(
            (item) => item.value === j.id,
          );
          const services = Array.isArray(j.services) ? j.services : [];
          return isSelectedSubCategoryId
            ? services.map((c) => ({ label: c.name, value: c.id }))
            : [];
        })
      : [];
  });
  const subModelOptions = categories.flatMap((i) => {
    const isSelectedCategoryId = categoryMainOptionSelected?.find(
      (item) => item.value === i.id,
    );
    return isSelectedCategoryId
      ? i.subsections.flatMap((j) => {
          const isSelectedSubCategoryId = categoryOptionSelected?.find(
            (item) => item.value === j.id,
          );
          const services = Array.isArray(j.services) ? j.services : [];
          return isSelectedSubCategoryId
            ? services.flatMap((s) => {
                const serviceQuestions = Array.isArray((s as any)?.questions)
                  ? ((s as any).questions as Array<any>)
                  : [];
                const isSelectedService = modelPhoneOptionSelected?.find(
                  (item) => item.value === s.id,
                );
                return isSelectedService
                  ? serviceQuestions.map((sub) => ({
                      label: sub?.text,
                      value: sub?.number,
                    }))
                  : [];
              })
            : [];
        })
      : [];
  });

  return (
    <ConfirmPoliticsContext.Provider value={{ accept, setAccept }}>
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

          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="city"
            placeholder="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
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
            options={categoriesMainOptions}
            onChange={(selected: Option[] | null) => {
              setCategoryMainOptionSelected(selected);
              setCategoryOptionSelected([]); // Reset sub-categories
              setModelPhoneOptionSelected([]); // Reset models
            }}
            value={categoryMainOptionSelected}
            isMulti={true} // Allow multiple main categories if needed
            menuPlacement={'bottom'}
          />
          {categoryMainOptionSelected &&
            categoryMainOptionSelected.length > 0 && (
              <MultiSelect
                key="categories_sub_id"
                placeholder="Подкатегории"
                options={categoriesOptions}
                onChange={(selected: Option[] | null) => {
                  setCategoryOptionSelected(selected);
                  setModelPhoneOptionSelected([]); // Reset models on sub-category change
                }}
                value={categoryOptionSelected}
                isSelectAll={true}
                isMulti={true}
                menuPlacement={'bottom'}
                isDisabled={
                  !categoryMainOptionSelected ||
                  categoryMainOptionSelected.length === 0
                }
              />
            )}
          {categoryOptionSelected && categoryOptionSelected.length > 0 && (
            <MultiSelect
              key="model_phone_id"
              placeholder="Модель устройства/услуги"
              options={modelPhoneOptions}
              onChange={(selected: Option[] | null) =>
                setModelPhoneOptionSelected(selected)
              }
              value={modelPhoneOptionSelected}
              isSelectAll={true}
              isMulti={true}
              menuPlacement={'bottom'}
              isDisabled={
                !categoryOptionSelected || categoryOptionSelected.length === 0
              }
            />
          )}
          {modelPhoneOptionSelected && modelPhoneOptionSelected.length > 0 && (
            <MultiSelect
              key="sub_model_phone_id"
              placeholder="Детали модели / подуслуги"
              options={subModelOptions}
              onChange={(selected: Option[] | null) =>
                setSubModelOptionSelected(selected)
              }
              value={subModelOptionSelected}
              isSelectAll={true}
              isMulti={true}
              menuPlacement={'bottom'}
              isDisabled={
                !modelPhoneOptionSelected ||
                modelPhoneOptionSelected.length === 0
              }
            />
          )}

          <label className={styles.registrationContractorPage_form_loginKeep}>
             <input
               className={styles.registrationContractorPage_form_loginKeep_input}
               type="checkbox"
               onChange={(e) => setKeep(e.target.checked)}
             />
             Оставаться в системе
          </label>

          <ConfirmPolitics />

          <button
            className={styles.registrationContractorPage_form_button}
            type="submit"
            disabled={registerContractorMutation.isPending}
          >
            {registerContractorMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </ConfirmPoliticsContext.Provider>
  );
};

// todo: удалить ненужный код
//~ // Wrapper component to provide ConfirmPoliticsContext if it's not already provided by a parent
//~ const RegistrationContractorPageWithContext = () => {
  //~ const [accept, setAccept] = useState(false);
  //~ return (
    //~ <ConfirmPoliticsContext.Provider value={{ accept, setAccept }}>
      //~ <RegistrationContractorPage />
    //~ </ConfirmPoliticsContext.Provider>
  //~ );
//~ };

// export default RegistrationContractorPageWithContext; // Exporting the version with context provider
export default RegistrationContractorPage; // Or export this if context is always provided by a parent
