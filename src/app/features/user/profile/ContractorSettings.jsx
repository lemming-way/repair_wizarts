import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import 'swiper/css';
import 'swiper/css/navigation';

import 'app/scss/profile.css';
import style from './ContractorSettings.module.css';
import { MultiSelect } from 'app/shared/ui/';
import { useLanguage } from 'app/state/language';
import { useUser, updateUser, BusinessModel } from 'app/state/user';
import { useServices, useCities } from 'app/state/site-data';

const experienceOptions = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: 'More than 5 years' },
];

function ContractorSettings() {
  const text = useLanguage();
  const [categoryOptionSelected, setCategoryOptionSelected] = useState([]);
  const [subcategoryOptionSelected, setSubcategoryOptionSelected] = useState([]);
  const [serviceOptionSelected, setServiceOptionSelected] = useState([]);
  const [experience, setExperience] = useState(null);

  const { categories, subcategories, services } = useServices();
  const { cities } = useCities();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    description: '',
    organizationName: '',
    address: '',
    experience: '',
    city: '',
  });
  const [businessModel, setBusiness] = useState(BusinessModel.IndependentTechnician);

  const getFormAttrs = (field) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], form);

    const onChange = (e) => {
      const newValue = e.target.value;
      const [first, second] = field.split('.');

      if (second) {
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

  useEffect(() => {
    if (!user.id) return;

    const selectedServiceIds = Array.isArray(user.services)
      ? user.services
      : [];

    const initialServiceOptions = [];
    const initialSubcategoryOptions = [];
    const initialCategoryOptions = [];

    const categoryIds = {};
    const subcategoryIds = {};

    selectedServiceIds.forEach(serviceId => {
      const serviceName = services[serviceId].name;
      if (serviceName) {
        initialServiceOptions.push({ label: serviceName, value: serviceId });
      }

      const subId = services[serviceId].parent;
      if (subId && !subcategoryIds[subId]) {
        initialSubcategoryOptions.push({ label: subcategories[subId].name, value: subId });
        subcategoryIds[subId] = true;

        const secId = subcategories[subId].parent;
        if (secId && !categoryIds[secId]) {
          initialCategoryOptions.push({ label: categories[secId].name, value: secId });
          categoryIds[secId] = true;
        }
      }
    });

    setCategoryOptionSelected(initialCategoryOptions);
    setSubcategoryOptionSelected(initialSubcategoryOptions);
    setServiceOptionSelected(initialServiceOptions);

    setExperience(
      user.experience
        ? [
            experienceOptions.find(
              (opt) => opt.value === user.experience,
            ),
          ]
        : null,
    );

    setForm({
      description: user.description || '',
      organizationName: user.organizationName,
      address: user.address,
      city: String(user.locality || ''),
      experience: user.experience,
    });

    setBusiness(user.businessModel);
  }, [user, categories, subcategories, services]);

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  // Early return if no user ID
  if (!user.id) {
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      description: form.description,
      organizationName: form.organizationName,
      address: form.address,
      experience: Number(form.experience),
      locality: Number(form.city) || 0,
      businessModel,
      services: serviceOptionSelected.map(opt => opt.value) || [],
    };

    try {
      await updateUser(queryClient, payload);
      setError('');
      setSuceeded(true);
    } catch (err) {
      setError(err.message);
      setSuceeded(false);
    }
  };

  const categoryOptions = Object.entries(categories).map(([id, { name }]) => ({
    label: name,
    value: id
  }));

  const subcategoryOptions = [];
  for (const { value: id } of categoryOptionSelected) {
    const category = categories[id];
    if (category) {
      subcategoryOptions.push(...category.subcategories.map(subId => ({
        label: subcategories[subId].name,
        value: subId
      })));
    }
  }

  const serviceOptions = [];
  for (const { value: id } of subcategoryOptionSelected) {
    const subcategory = subcategories[id];
    if (subcategory) {
      serviceOptions.push(...subcategory.services.map(srvId => ({
        label: services[srvId].name,
        value: srvId
      })));
    }
  }

  return (
    <>
      <div className={`mini-main-2 df ${style.wrap_flex}`}>
        <form className="input-wrap-2" onSubmit={onSubmit}>
          {suceeded && (
            <div className="succeed-v">{text('Data updated successfully')}</div>
          )}
          {error && <div className="auth-err">{error}</div>}

          {/*
          <label className={style.checkboxLabel}>
            <input
              type="checkbox"
              name="is_active"
              checked={mainForm.is_active}
              onChange={(e) => setMainForm(prev => ({ ...prev, is_active: e.target.checked }))}
            />
            {text('Receive orders')}
          </label>
          */}

          <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
            <MultiSelect
              key="category_id"
              placeholder={text('Type of category')}
              options={categoryOptions}
              isMulti={true}
              isSelectAll={true}
              onChange={(selected) => {
                setCategoryOptionSelected(selected);
                setSubcategoryOptionSelected([]);
                setServiceOptionSelected([]);
              }}
              value={categoryOptionSelected}
              menuPlacement="bottom"
            />
            <MultiSelect
              key="subcategory_id"
              placeholder={text('Subcategories')}
              isMulti={true}
              isSelectAll={true}
              options={subcategoryOptions}
              onChange={(selected) => {
                setSubcategoryOptionSelected(selected);
                setServiceOptionSelected([]);
              }}
              value={subcategoryOptionSelected}
              menuPlacement="bottom"
              isDisabled={!categoryOptionSelected.length}
            />
            <MultiSelect
              key="services"
              isSelectAll={true}
              isMulti={true}
              placeholder={text('Services')}
              options={serviceOptions}
              onChange={(selected) =>
                setServiceOptionSelected(selected)
              }
              value={serviceOptionSelected}
              menuPlacement="bottom"
              isDisabled={!subcategoryOptionSelected.length}
            />
          </div>

          <input
            type="text"
            placeholder={text('Address')}
            id="offer-input"
            {...getFormAttrs('address')}
          />
          <select
            className={style.selectField}
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          >
            <option value="">{text('Select city')}</option>
            {Object.entries(cities).map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={text('Organization name')}
            {...getFormAttrs('organizationName')}
          />

          <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
            <MultiSelect
              style={{ width: '100%' }}
              key="experience"
              placeholder={text('Work experience')}
              options={experienceOptions}
              onChange={(selected) => {
                setExperience(selected ? [selected] : null);
                setForm((prev) => ({
                  ...prev,
                  experience: selected?.value || '',
                }));
              }}
              value={experience}
              isSelectAll={false}
              menuPlacement="bottom"
            />
          </div>

          <textarea
            placeholder={
              businessModel === BusinessModel.IndependentTechnician ? text('About me') : text('About organization')
            }
            {...getFormAttrs('description')}
          />

          <div>
            <button type="submit" className="goooSaveButton">
              {text('Save')}
            </button>
          </div>
        </form>

        <div className={`check-input-content ${style.wrap_check}`}>
          <div className="second-check">
            <h4>{text('Business model')}:</h4>
            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="yesornow"
                onChange={() => setBusiness(BusinessModel.IndependentTechnician)}
                checked={businessModel === BusinessModel.IndependentTechnician}
              />
              <label htmlFor="yesornow">
                <p>{text(BusinessModel.IndependentTechnician)}</p>
              </label>
            </div>

            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="inputradioservicebtn"
                onChange={() => setBusiness(BusinessModel.ServiceCenter)}
                checked={businessModel === BusinessModel.ServiceCenter}
              />
              <label htmlFor="inputradioservicebtn">
                <p>{text(BusinessModel.ServiceCenter)}</p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContractorSettings;
