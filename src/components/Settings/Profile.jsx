import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import '../../scss/profile.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { MultiSelect } from '../../shared/ui/';
import style from './Profile.module.css';
import { useLanguage } from '../../state/language';
import { useUserExtended, updateUser, updateUserDetails } from '../../state/user';
import { useServices } from '../../state/site-data';

const experienceOptions = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: 'More than 5 years' },
];

function Profile() {
  const text = useLanguage();
  const [categoryOptionSelected, setCategoryOptionSelected] = useState([]);
  const [subcategoryOptionSelected, setSubcategoryOptionSelected] = useState([]);
  const [serviceOptionSelected, setServiceOptionSelected] = useState([]);
  const [experience, setExperience] = useState(null);

  const { categories, subcategories, services } = useServices();
  const queryClient = useQueryClient();
  const { userEx } = useUserExtended();

  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    description: '',
    details: {
      organization_name: '',
      address: '',
      specialty: '',
      main_business: '',
      experience: '',
      city: '',
    },
  });
  const [business_model, setBusiness] = useState('Independent technician');

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
    if (!userEx.id || !userEx.details) return;

    const contractorDetails = userEx.details;

    const selectedServiceIds = Array.isArray(contractorDetails.services)
      ? contractorDetails.services
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
      contractorDetails.experience
        ? [
            experienceOptions.find(
              (opt) => opt.value === contractorDetails.experience,
            ),
          ]
        : null,
    );

    setForm({
      name: userEx.name,
      lastname: userEx.lastname,
      description: userEx.description || '',
      details: {
        organization_name: contractorDetails.organization_name || '',
        address: contractorDetails.address || '',
        city: contractorDetails.city || '',
        specialty: contractorDetails.specialty || '',
        main_business: contractorDetails.main_business || '',
        experience: contractorDetails.experience || '',
      },
    });

    setBusiness(contractorDetails.business_model || 'Independent technician');
  }, [userEx, categories, subcategories, services]);

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  // Early return if no user ID
  if (!userEx.id) {
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const details = {
      ...form.details,
      business_model,
      services: serviceOptionSelected.map(opt => opt.value) || [],
    };

    try {
      await updateUser(queryClient, form);
      await updateUserDetails(queryClient, details);
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
          <input type="text" placeholder={text('Name')} {...getFormAttrs('name')} />

          <input
            type="text"
            placeholder={text('Lastname')}
            {...getFormAttrs('lastname')}
          />

          <input
            type="text"
            placeholder={text('Address')}
            id="offer-input"
            {...getFormAttrs('details.address')}
          />
          <input
            type="text"
            placeholder={text('City')}
            id="offer-input"
            {...getFormAttrs('details.city')}
          />

          <input
            type="text"
            placeholder={text('Organization name')}
            {...getFormAttrs('details.organization_name')}
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
                  details: { ...prev.details, experience: selected?.value || '' },
                }));
              }}
              value={experience}
              isSelectAll={false}
              menuPlacement="bottom"
            />
          </div>

          <input
            type="text"
            placeholder={text('Main business')}
            {...getFormAttrs('details.main_business')}
          />

          <input
            type="text"
            placeholder={text('Type of activity')}
            {...getFormAttrs('details.specialty')}
          />

          <textarea
            placeholder={
              business_model === 'Independent technician' ? text('About me') : text('About organization')
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
                onChange={() => setBusiness('Independent technician')}
                checked={business_model === 'Independent technician'}
              />
              <label htmlFor="yesornow">
                <p>{text('Independent technician')}</p>
              </label>
            </div>

            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="inputradioservicebtn"
                onChange={() => setBusiness('Service center')}
                checked={business_model === 'Service center'}
              />
              <label htmlFor="inputradioservicebtn">
                <p>{text('Service center')}</p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
