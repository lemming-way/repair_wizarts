import React, { useEffect, useState, useContext } from 'react';
import MultiSelect, {
  Option,
} from '../../../components/MultiSelect/MultiSelect';
import { ConfirmPoliticsContext } from '../../../components/ConfirmPolitics/ConfirmPoliticsContext';
import ConfirmPolitics from '../../../components/ConfirmPolitics/ConfirmPolitics';
// import Error from "../../../components/Error/Error"; // Assuming Error component exists for displaying errors
import styles from './RegistrationMasterPage.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import appFetch from '../../../utilities/appFetch';

const API_BASE_URL = 'https://ibronevik.ru/taxi/c/tutor/api/v1/'; // Assuming API is on the same domain, otherwise specify full base URL e.g. 'https://ibronevik.ru/taxi'
const REGISTRATION_ENDPOINT = `${API_BASE_URL}/api/v1/register/`;

const RegistrationMasterPage = () => {
  const { categories } = useSelector((state: RootState) => state.categories);

  const [login, setLogin] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('+7(9');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { accept, setAccept } = useContext(ConfirmPoliticsContext);

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
    setSuccessMessage('');

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
    if (!uName) {
      setError('Имя и Фамилия должны быть заполнены.');
      return;
    }

    setIsLoading(true);

    const formattedPhone = phone.replace(/\D/g, '');

    const uDetails = {
      address,
      city,
      login,
      section: categoryMainOptionSelected || [],
      subsection: categoryOptionSelected || [],
      service: modelPhoneOptionSelected || [],
      subservice: subModelOptionSelected || [],
    };

    const dataForApi = {
      password,
      u_details: uDetails,
    };

    const bodyParams = {
      u_name: uName,
      u_phone: formattedPhone,
      u_email: email,
      u_role: '2',
      data: JSON.stringify(dataForApi),
    };

    try {
      console.log(dataForApi);
      const response = await appFetch('register/', {
        body: bodyParams,
      });
      if (response.code === '200' && response.status === 'success') {
        setSuccessMessage('Регистрация прошла успешно! ');
        if (response.data?.string) {
          setSuccessMessage(
            (prev) => prev + `Ваш пароль: ${response.data.string}. `,
          );
        }
        if (response.data?.['email status'] === true) {
          setSuccessMessage(
            (prev) => prev + 'Пароль отправлен на указанный E-mail. ',
          );
        }

        setLogin('');
        setAddress('');
        setCity('');
        setName('');
        setLastname('');
        setPhone('+7(9');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCategoryMainOptionSelected([]);
        setCategoryOptionSelected([]);
        setModelPhoneOptionSelected([]);
        if (typeof setAccept === 'function') {
          setAccept(false);
        }
      } else {
        let apiError = 'Ошибка регистрации.';
        if (response.message) {
          apiError = response.message;
        } else if (
          typeof response.data === 'string' &&
          response.data.startsWith('busy user data:')
        ) {
          apiError = `Данные заняты: ${response.data.replace(
            'busy user data: ',
            '',
          )}`;
        } else if (response.code && response.status) {
          apiError = `Ошибка ${response.code}: ${response.status}`;
        }
        setError(apiError);
      }
    } catch (err: any) {
      console.error('Registration API error:', err);
      setError(
        err?.message || 'Не удалось связаться с сервером. Попробуйте позже.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setPhoneHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    let formattedInput = inputValue.replace(/\D/g, ''); // Remove all non-digits first

    if (formattedInput.startsWith('79') || formattedInput.startsWith('89')) {
      if (formattedInput.startsWith('89')) {
        formattedInput = '79' + formattedInput.substring(2);
      }
    } else if (formattedInput.startsWith('9')) {
      formattedInput = '79' + formattedInput.substring(1);
    } else {
      // Allow user to clear or type freely if it doesn't match common patterns initially
    }

    let new_text = '+';
    if (formattedInput.length > 0) new_text += formattedInput[0]; // Country code (e.g., 7)
    if (formattedInput.length > 1)
      new_text += '(' + formattedInput.substring(1, 4);
    if (formattedInput.length >= 5)
      new_text += ')-' + formattedInput.substring(4, 7);
    if (formattedInput.length >= 8)
      new_text += '-' + formattedInput.substring(7, 9);
    if (formattedInput.length >= 10)
      new_text += '-' + formattedInput.substring(9, 11);

    if (
      new_text.length <= 3 &&
      inputValue !== '+7(9' &&
      inputValue !== '+7(' &&
      inputValue !== '+7' &&
      inputValue !== '+'
    ) {
      // If user deletes and it becomes too short
      setPhone('+7(9');
    } else if (new_text.length > 17) {
      setPhone(new_text.substring(0, 17));
    } else {
      setPhone(new_text);
    }

    if (/[^0-9()+-]/.test(inputValue.substring(1)) && inputValue !== '+7(9') {
      // Check after initial '+'
      setError('В номере, пожалуйста, введите только цифры, скобки и дефисы.');
    } else {
      setError('');
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
          return isSelectedSubCategoryId
            ? j.services.map((c) => ({ label: c.name, value: c.id }))
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
          return isSelectedSubCategoryId
            ? j.services.flatMap((s) => {
                const isSelectedService = modelPhoneOptionSelected?.find(
                  (item) => item.value === s.id,
                );
                return isSelectedService
                  ? (s.questions || []).map((sub) => ({
                      label: sub.text,
                      value: sub.number,
                    }))
                  : [];
              })
            : [];
        })
      : [];
  });

  return (
    <ConfirmPoliticsContext.Provider value={{ accept, setAccept }}>
      <div className={`${styles.registrationMasterPage}`}>
        <h1 className={styles.registrationMasterPage_title}>Регистрация</h1>
        <form
          className={styles.registrationMasterPage_form}
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
          {successMessage && (
            <div
              style={{
                marginBottom: '10px',
                color: 'green',
                textAlign: 'center',
              }}
            >
              {successMessage}
            </div>
          )}

          <input
            className={styles.registrationMasterPage_form_input}
            type="text"
            name="login_form" // Changed name to avoid conflict with 'login' state
            placeholder="Логин (для входа на сайт)"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <input
            className={styles.registrationMasterPage_form_input}
            type="text"
            name="city"
            placeholder="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <input
            className={styles.registrationMasterPage_form_input}
            type="text"
            name="address_form"
            placeholder="Адрес (улица, дом)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <input
            className={styles.registrationMasterPage_form_input}
            type="text"
            name="name_form"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={styles.registrationMasterPage_form_input}
            type="text"
            name="lastname_form"
            placeholder="Фамилия"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
          <div className={styles.registrationMasterPage_input_phone_wrap}>
            <input
              placeholder="Телефон"
              className={`${styles.registrationMasterPage_form_input} ${
                phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
              }`}
              type="tel" // Changed to type="tel" for better mobile UX
              name="phone_form"
              value={phone}
              onChange={setPhoneHandler}
              required
              maxLength={17} // +7(XXX)-XXX-XX-XX
            />
          </div>
          <input
            className={styles.registrationMasterPage_form_input}
            type="email"
            name="email_form"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.registrationMasterPage_form_input}
            type="password"
            name="password_form"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className={styles.registrationMasterPage_form_input}
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

          <ConfirmPolitics />

          <button
            className={styles.registrationMasterPage_form_button}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </ConfirmPoliticsContext.Provider>
  );
};

// Wrapper component to provide ConfirmPoliticsContext if it's not already provided by a parent
const RegistrationMasterPageWithContext = () => {
  const [accept, setAccept] = useState(false);
  return (
    <ConfirmPoliticsContext.Provider value={{ accept, setAccept }}>
      <RegistrationMasterPage />
    </ConfirmPoliticsContext.Provider>
  );
};

export default RegistrationMasterPageWithContext; // Exporting the version with context provider
// export default RegistrationMasterPage; // Or export this if context is always provided by a parent
