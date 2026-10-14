import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnyImage } from 'app/shared/ui';
import { useLanguage } from 'app/state/language';
import { useGlobalState } from 'app/state/global';
import { useProducts } from 'app/state/site-data';
import { useCreateOrder } from 'app/state/order';
import 'app/styles/legacy/added.css';
import style from './CreateMarket/CreateMarket.module.css';

const fourthLevelOptions = [
  'Настройка оборудования',
  'Диагностика',
  'Установка программ',
  'Удалённая помощь',
  'Обслуживание систем',
  'Консультация специалиста',
  'Срочный выезд',
];

function CreateMarket() {
  const text = useLanguage();
  const currentCity = useGlobalState('currentCity');
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState([]);

  const { createOrder } = useCreateOrder();

  const { categories, subcategories, products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedFourthLevel, setSelectedFourthLevel] = useState('');

  const categoriesOptions = Object.entries(categories).map(([id, category]) => ({
      value: String(id),
      label: category.name,
  }));

  const subcategoriesOptions =
    selectedCategory && categories && subcategories
    ? categories[selectedCategory]
        .subcategories
        .map(subId => ({ value: String(subId), label: subcategories[subId].name }))
    : [];

  const productsOptions =
    selectedSubcategory && subcategories && products
    ? subcategories[selectedSubcategory]
        .products
        .map(productId => ({ value: String(productId), label: products[productId].name }))
    : [];

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
    event.target.value = '';
  };

  const removePhoto = (photoIndex) => {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== photoIndex)
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!address || !selectedProduct || !description || !price) {
        setError(text('Mandatory parameter is empty.'));
        return;
    }

    try {
      await createOrder({
        cityId: currentCity,
        address: address,
        productId: Number(selectedProduct),
        description: description,
        attachments: photos,
        price: Number(price),
      });

      navigate('/client/requests');
    } catch (err) {
      // Обработка ошибок
      let errorMessage = text('Check the correctness of the entered data');
      if (err instanceof Error && err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = text('Add device');
  }, [text]);

  return (
    <section className={style.page}>
      <form className={style.form} onSubmit={onSubmit}>
        <header className={style.header}>
          <span className={style.eyebrow}>Биржа заказов</span>
          <h1>Размещение заказов на бирже исполнителей</h1>
          <p>Опишите задачу подробно — так исполнители быстрее оценят работу и предложат подходящие условия.</p>
        </header>

        <div className={style.layout}>
          <div className={style.mainColumn}>
            <section className={style.card}>
              <h2>Описание заказа</h2>
              <div className={style.tips}>
                <span>Уточните объём работ</span>
                <span>Опишите желаемый результат</span>
                <span>Укажите важные требования</span>
              </div>
              <label className={style.field}>
                <span>Адрес выполнения работ</span>
                <input required placeholder="Укажите адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
              <label className={style.field}>
                <span>Детальное описание задачи</span>
                <textarea required placeholder="Опишите подробно, что нужно сделать" value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
            </section>

            <section className={style.card}>
              <h2>Рубрика</h2>
              <p className={style.helper}>Выберите путь услуги. Четыре шага расположены в две строки.</p>
              <div className={style.categoryGrid}>
                <label className={style.categoryStep}><b>1</b><select value={selectedCategory} onChange={(e) => { setSelectedCategory(Number(e.target.value)); setSelectedSubcategory(''); setSelectedProduct(''); setSelectedFourthLevel(''); }}><option value="" disabled>Категория</option>{categoriesOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label className={style.categoryStep}><b>2</b><select value={selectedSubcategory} disabled={!selectedCategory} onChange={(e) => { setSelectedSubcategory(Number(e.target.value)); setSelectedProduct(''); setSelectedFourthLevel(''); }}><option value="" disabled>Направление</option>{subcategoriesOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
                <label className={style.categoryStep}><b>3</b><select required value={selectedProduct} onChange={(e) => { setSelectedProduct(Number(e.target.value)); setSelectedFourthLevel(''); }} disabled={!selectedSubcategory}><option value="" disabled>Вид услуги</option>{productsOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
                <label className={style.categoryStep}><b>4</b><select required value={selectedFourthLevel} onChange={(e) => setSelectedFourthLevel(e.target.value)} disabled={!selectedProduct}><option value="" disabled>Уточнение услуги</option>{fourthLevelOptions.map((item, index) => <option value={`mock-${index + 1}`} key={item}>{item}</option>)}</select></label>
              </div>
            </section>

            <section className={style.card}>
              <h2>Стоимость</h2>
              <label className={style.field}>
                <span>Ваш бюджет, ₽</span>
                <input required min="1" type="number" placeholder="Например, 5 000" value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>
            </section>
          </div>

          <aside className={`${style.card} ${style.photoCard}`}>
            <div className={style.photoHeader}><div><h2>Фотографии</h2><p>JPG или PNG, до 10 файлов</p></div><span>{photos.length}/10</span></div>
            <input className={style.fileInput} type="file" onChange={handleImageChange} accept="image/png, image/jpeg" multiple id="upimg" ref={fileInputRef} />
            <label className={style.uploadArea} htmlFor="upimg"><img src="/img/accommodation_img/photo.png" alt="" /><b>Добавить фотографии</b><span>Можно выбрать несколько файлов</span></label>
            {photos.length > 0 && <div className={style.photoGrid}>{photos.map((photo, index) => <div className={style.photoItem} key={`${photo.name}-${photo.lastModified}`}><AnyImage src={photo} alt={`Предпросмотр ${index + 1}`} /><button type="button" onClick={() => removePhoto(index)} aria-label="Удалить фотографию">×</button></div>)}</div>}
          </aside>
        </div>

        {error && <div className={style.error}>{error}</div>}
        <div className={style.actions}><button type="button" className={style.backButton} onClick={() => navigate(-1)}>Назад</button><button type="submit" className={style.submitButton}>Разместить заказ</button></div>
      </form>
    </section>
  );
}

export default CreateMarket;
