import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from 'app/state/language';
import { MultiSelect, MultiSelectOption } from 'app/shared/ui';
import { ConfirmPolitics } from './ConfirmPolitics';
import { PhoneNumber } from '../PhoneNumber';
// import Error from "app/components/Error/Error"; // Assuming Error component exists for displaying errors

import { useCities, useProducts } from 'app/state/site-data';
import { useRegisterContractor, BusinessModel } from 'app/state/user';
import styles from './RegistrationContractorPage.module.scss';
import sharedStyles from './RegistrationPage.module.scss';

const experienceOptions = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: 'More than 5 years' },
];

const RegistrationContractorPage = () => {
  const text = useLanguage();
  const { categories, subcategories, products } = useProducts();
  const { cities } = useCities();
  const navigate = useNavigate();
  const { register, isPending } = useRegisterContractor();

  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('+7(9');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState<MultiSelectOption | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [businessModel, setBusinessModel] = useState(BusinessModel.IndependentTechnician);

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
  const [productOptionSelected, setProductOptionSelected] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    document.title = text('Contractor Registration');
  }, [text]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!accept) {
      setError(
        text('To continue, you must accept the privacy policy.'),
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(text('Passwords do not match.'));
      return;
    }

    if (phone.replace(/\D/g, '').length < 11) {
      setError(text('Phone number is incomplete.'));
      return;
    }

    const uName = `${name.trim()} ${lastname.trim()}`.trim();
    if (!uName) {
      setError(text('First and Last name must be filled in.'));
      return;
    }

    try {
      await register({
        name: name.trim(),
        lastname: lastname.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        locality: Number(city || 0),
        password,
        address: address.trim(),
        experience: Number(experience?.value || 0),
        products: productOptionSelected?.map(opt => Number(opt.value)) || [],
        businessModel: businessModel,
        organizationName: businessModel === BusinessModel.ServiceCenter ? organizationName.trim() : '',
        description: description.trim(),
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

  const productOptions: MultiSelectOption[] = [];
  for (const { value: id } of subcategoryOptionSelected) {
    productOptions.push(...subcategories[id].products.map(id => ({
      label: products[id].name,
      value: id
    })));
  }

  return (
      <div className={`${styles.registrationContractorPage}`}>
        <h1 className={styles.registrationContractorPage_title}>{text('Registration')}</h1>
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
              Object.entries(cities).map(([ id, { name } ]) =>
                <option key={id} value={id}>{name}</option>
              )
            }
          </select>
          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="address_form"
            placeholder={text('Address (street, house)')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="name_form"
            placeholder={text('First name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="text"
            name="lastname_form"
            placeholder={text('Last name')}
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
          <div className={styles.registrationContractorPage_input_phone_wrap}>
            <PhoneNumber
              placeholder={text('Phone')}
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
            placeholder={text('Email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="password"
            name="password_form"
            placeholder={text('Password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className={styles.registrationContractorPage_form_input}
            type="password"
            name="confirm_password_form"
            placeholder={text('Confirm password')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className={sharedStyles.registrationPage_checkbox_container}>
            <h4>{text('Business model')}:</h4>
            <div>
              <input
                type="radio"
                name="businessModel"
                id="independentTechnician"
                onChange={() => setBusinessModel(BusinessModel.IndependentTechnician)}
                checked={businessModel === BusinessModel.IndependentTechnician}
              />
              <label htmlFor="independentTechnician">
                <p>{text(BusinessModel.IndependentTechnician)}</p>
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="businessModel"
                id="serviceCenter"
                onChange={() => setBusinessModel(BusinessModel.ServiceCenter)}
                checked={businessModel === BusinessModel.ServiceCenter}
              />
              <label htmlFor="serviceCenter">
                <p>{text(BusinessModel.ServiceCenter)}</p>
              </label>
            </div>
          </div>

          {businessModel === BusinessModel.ServiceCenter &&
            <input
              className={styles.registrationContractorPage_form_input}
              type="text"
              name="organization_name_form"
              placeholder={text('Organization name')}
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          }

          <MultiSelect
            key="experience_id"
            placeholder={text('Work experience')}
            options={experienceOptions}
            onChange={(selected: MultiSelectOption | null) => {
              setExperience(selected);
            }}
            value={experience}
            isMulti={false}
            menuPlacement={'bottom'}
          />

          <textarea
            className={styles.registrationContractorPage_form_input}
            name="description_form"
            placeholder={
              (businessModel === BusinessModel.IndependentTechnician
                ? text('About me')
                : text('About organization'))
              + ` (${text('optional')})`
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          <MultiSelect
            key="category_main_id"
            placeholder={text('Type of main category')}
            options={categoryOptions}
            onChange={(selected: MultiSelectOption[] | null) => {
              setCategoryOptionSelected(selected || []);
              setSubcategoryOptionSelected([]); // Reset sub-categories
              setProductOptionSelected([]); // Reset models
            }}
            value={categoryOptionSelected}
            isMulti={true}
            menuPlacement={'bottom'}
          />
          {categoryOptionSelected.length > 0 && (
            <MultiSelect
              key="categories_sub_id"
              placeholder={text('Subcategories')}
              options={subcategoryOptions}
              onChange={(selected: MultiSelectOption[] | null) => {
                setSubcategoryOptionSelected(selected || []);
                setProductOptionSelected([]); // Reset models on sub-category change
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
              placeholder={text('Service name')}
              options={productOptions}
              onChange={(selected: MultiSelectOption[] | null) =>
                setProductOptionSelected(selected || [])
              }
              value={productOptionSelected}
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
            <label htmlFor="keep-authorized">{text('Stay logged in')}</label>
          </div>

          <ConfirmPolitics accept={accept} onChange={setAccept}/>

          <button
            className={styles.registrationContractorPage_form_button}
            type="submit"
            disabled={isPending}
          >
            {isPending ? text("Registering...") : text("Register")}
          </button>
        </form>
      </div>
  );
};

export default RegistrationContractorPage;
