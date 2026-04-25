import { useEffect, useState, useRef } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import { MultiSelect, AnyImage, getKeyFor } from 'app/shared/ui/';
import { useLanguage } from 'app/state/language';
import { useUser, useUpdateUser, useSetContractorActive, BusinessModel } from 'app/state/user';
import { useProducts, useCities } from 'app/state/site-data';
import 'app/scss/profile.css';
import style from './ContractorSettings.module.css';

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
  const [productOptionSelected, setProductOptionSelected] = useState([]);
  const [experience, setExperience] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [swiper, setSwiper] = useState(null);
  const swiperObserver = useRef(null);

  const { categories, subcategories, products } = useProducts();
  const { cities } = useCities();
  const { user } = useUser();
  const { save : saveUpdates } = useUpdateUser();
  const { setContractorActive } = useSetContractorActive();

  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    //~ description: '',
    organizationName: '',
    address: '',
    experience: '',
    city: '',
  });
  const [businessModel, setBusiness] = useState(BusinessModel.IndependentTechnician);
  const [isActive, setIsActive] = useState(true);

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

    const userServicesMap = user.services || {};

    const initialProductOptions = [];
    const initialSubcategoryOptions = [];
    const initialCategoryOptions = [];

    const categoryIds = {};
    const subcategoryIds = {};

    Object.keys(userServicesMap).forEach(productIdStr => {
      const productId = Number(productIdStr);
      if (products[productId]?.name) {
        initialProductOptions.push({ label: products[productId].name, value: productId });

        const subId = products[productId].parent;
        if (subId && subcategories[subId] && !subcategoryIds[subId]) {
          initialSubcategoryOptions.push({ label: subcategories[subId].name, value: subId });
          subcategoryIds[subId] = true;

          const secId = subcategories[subId].parent;
          if (secId && categories[secId] && !categoryIds[secId]) {
            initialCategoryOptions.push({ label: categories[secId].name, value: secId });
            categoryIds[secId] = true;
          }
        }
      }
    });

    setCategoryOptionSelected(initialCategoryOptions);
    setSubcategoryOptionSelected(initialSubcategoryOptions);
    setProductOptionSelected(initialProductOptions);

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
      //~ description: user.description || '',
      organizationName: user.organizationName,
      address: user.address,
      city: String(user.locality || ''),
      experience: user.experience,
    });

    setBusiness(user.businessModel);
    setIsActive(user.active);
    setPhotos(user.photos || []);
  }, [user, categories, subcategories, products]);

  // Нужно для корректного обновления свайпера
  useEffect(() => {
    const observer = new ResizeObserver(() => swiper?.update());
    swiperObserver.current = observer;
    return () => observer.disconnect();
  }, [ swiper ]);

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  // Early return if no user ID
  if (!user.id) {
    return null;
  }

  // загрузка фото
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files
      .filter(file => photos.every(existing => {
        return !(existing instanceof File) ||
               existing.name !== file.name ||
               existing.size !== file.size ||
               existing.type !== file.type ||
               existing.lastModified !== file.lastModified;
      }));
    if (photos.length + newPhotos.length > 10) {
      setError(text('You can upload no more than 10 files.'));
      return;
    }
    setError('');
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removeImage = (imageToRemove) => {
    setPhotos(prev => prev.filter(image => image !== imageToRemove));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const newServicesMap = {};
    const currentServicesMap = user.services || {};

    productOptionSelected.forEach(opt => {
      const productId = Number(opt.value);
      // Сохраняем существующие данные услуги, если она уже была выбрана
      if (currentServicesMap[productId]) {
        newServicesMap[productId] = currentServicesMap[productId];
      } else {
        // Для вновь выбранных услуг инициализируем пустым массивом
        newServicesMap[productId] = [];
      }
    });

    const payload = {
      //~ description: form.description,
      organizationName: form.organizationName,
      address: form.address,
      experience: Number(form.experience),
      locality: Number(form.city) || 0,
      businessModel,
      services: newServicesMap,
      photos
    };

    try {
      await saveUpdates(payload);
      if (isActive !== user.active) {
        await setContractorActive(isActive);
      }
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

  const productOptions = [];
  for (const { value: id } of subcategoryOptionSelected) {
    const subcategory = subcategories[id];
    if (subcategory) {
      productOptions.push(...subcategory.products.map(prodId => ({
        label: products[prodId].name,
        value: prodId
      })));
    }
  }

  return (
    <>
      <div className={`mini-main-2 df ${style.wrap_flex}`}>
        <form id="contractor-settings-form" className="input-wrap-2" onSubmit={onSubmit}>
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
                setProductOptionSelected([]);
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
                setProductOptionSelected([]);
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
              options={productOptions}
              onChange={(selected) =>
                setProductOptionSelected(selected)
              }
              value={productOptionSelected}
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

          {businessModel === BusinessModel.ServiceCenter &&
            <input
              type="text"
              placeholder={text('Organization name')}
              {...getFormAttrs('organizationName')}
            />
          }

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

          {/* В настоящее время не сработает из-за ограничений API
          <textarea
            placeholder={
              businessModel === BusinessModel.IndependentTechnician ? text('About me') : text('About organization')
            }
            {...getFormAttrs('description')}
          />
          */}
        </form>

        <div className={`check-input-content ${style.wrap_check}`}>
          <div className="second-check">
            <h4>{text('Activeness')}:</h4>
            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="checkbox"
                id="is-active"
                name="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="is-active">
                <p>{text('Receive orders')}</p>
              </label>
            </div>

            <h4>{text('Business model')}:</h4>
            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="business-model-independent"
                onChange={() => setBusiness(BusinessModel.IndependentTechnician)}
                checked={businessModel === BusinessModel.IndependentTechnician}
              />
              <label htmlFor="business-model-independent">
                <p>{text(BusinessModel.IndependentTechnician)}</p>
              </label>
            </div>

            <div className="first_check df" style={{ gap: '0' }}>
              <input
                type="radio"
                name="select__service"
                id="business-model-service"
                onChange={() => setBusiness(BusinessModel.ServiceCenter)}
                checked={businessModel === BusinessModel.ServiceCenter}
              />
              <label htmlFor="business-model-service">
                <p>{text(BusinessModel.ServiceCenter)}</p>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={style.photo_block}>
        <div className="accom_2 mobile-accom_2">
          <h2>Фотографии</h2>
          <h3>Загрузите до 10 изображений</h3>
        </div>
        <div className={style.photo_upload}>
          <div className={`photo_upload-img mobile-photo_upload-img ${style.photo_upload_img}`}>
            <label htmlFor="upimg">
              <img
                src="/img/accommodation_img/photo.png"
                alt="img absent"
              />
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/png, image/jpeg"
              multiple
              id="upimg"
              style={{ display: 'none' }}
            />
          </div>
          {photos.length > 0 &&
            <Swiper
              slidesPerView="auto"
              spaceBetween={20}
              navigation={true}
              modules={[Navigation]}
              className="mySwiper"
              onSwiper={setSwiper}
            >
              {photos.map((photo, index) => (
                <SwiperSlide key={getKeyFor(photo)} style={{width: 'max-content'}} ref={el => console.log(el)}>
                  <div className={style.swiper_slide} ref={el => el && swiperObserver.current?.observe(el)}>
                    <AnyImage
                      src={photo}
                      alt={`upload-preview-${index}`}
                      className={style.swiper_image}
                    />
                    <button className={style.photo_delete_btn} onClick={() => removeImage(photo)}>
                      &times;
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          }
        </div>
      </div>

      <div>
        <button type="submit" form="contractor-settings-form" className="goooSaveButton">
          {text('Save')}
        </button>
      </div>
    </>
  );
}

export default ContractorSettings;
