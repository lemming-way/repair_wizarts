import React, { useState } from 'react';
import Dropdown from 'react-multilevel-dropdown';
import arrowDown from '../../../../img/header/icons/arrow-down-icon.svg';
import styles from './ServiceDropdown.module.scss';
import { Link } from 'react-router-dom';

const ServiceDropdown = () => {
  const menu: string[] = [
    'Ремонт телефонов',
    'Ремонт планшетов',
    'Ремонт ноутбуков',
    'Ремонт компьютеров',
    'Ремонт часов',
    'Аксессуары',
  ];
  const submenuData: string[] = [
    'Ремонт iPhone',
    'Ремонт iPad',
    'Ремонт MacBook',
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      title={
        <>
          <span>Услуги</span>
          <img
            src={arrowDown}
            alt=""
            style={{
              transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 1s ease',
              marginLeft: '5px',
            }}
          />
        </>
      }
      isActive={isOpen}
      menuClassName={styles.serviceDropdown}
      wrapperClassName={styles.serviceDropdown_wrapper}
      buttonClassName={styles.serviceDropdown_button}
      onClick={() => setIsOpen(!isOpen)}
      position="left"
      openOnHover={true}
    >
      {/* 1 lvl */}
      <div className={styles.serviceDropdown_lvl1}>
        {/* <div className={styles.lvl1_row}>
      <img src="/img/microshema.png" alt="" />
      <p>электроника</p>
    </div> */}
        <Dropdown.Item className={` ${styles.serviceDropdown_item_lvl1}`}>
          <span className={styles.serviceDropdown_lvl1__span}>
            <img style={{ height: '22px' }} src="/img/microshema.png" alt="" />
            <p>электроника</p>
          </span>
          {/* 2lvl */}
          <Dropdown.Submenu
            position="right-top"
            className={styles.Submenu_submenu}
          >
            {menu.map((menu, index) => (
              <Dropdown.Item
                className={styles.serviceDropdown_item}
                key={index}
              >
                <span className={styles.serviceDropdown_item_menu}>{menu}</span>

                {/* 3lvl */}
                <Dropdown.Submenu
                  position="right-top"
                  className={styles.Submenu_submenu_lvl3}
                >
                  {submenuData.map((submenu, index) => (
                    <Dropdown.Item
                      className={`${styles.serviceDropdown_item} ${styles.serviceDropdown_item_lvl3}`}
                      key={index}
                    >
                      <Link to="/devices/1">
                        <span>{submenu}</span>
                      </Link>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Submenu>
              </Dropdown.Item>
            ))}
          </Dropdown.Submenu>
        </Dropdown.Item>

        <div className={styles.lvl1_row}>
          <p>Мастера по ремонту</p>
        </div>
      </div>
    </Dropdown>
  );
};

export default ServiceDropdown;
//! Версия с подключением бека, но нужно оптимизировать получение сервисов
// import React, { useCallback, useEffect, useState } from 'react';
// import Dropdown from 'react-multilevel-dropdown';
// import arrowDown from '../../../../img/header/icons/arrow-down-icon.svg';
// import styles from './ServiceDropdown.module.scss';
// import { Link } from 'react-router-dom';
// interface Service {
//   id: number;
//   name: string;
// }

// interface SubCategory {
//   id: number;
//   name: string;
// }

// interface Category {
//   id: number;
//   name: string;
// }

// interface CategoryWithSubcategories {
//   category: string;
//   sub_categories: {
//     sub_category: string;
//     services: Service[];
//   }[];
// }

// const ServiceDropdown = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [dropdownContent, setDropdownContent] = useState<
//     CategoryWithSubcategories[]
//   >([]);
//   const fetchServices = useCallback(async (): Promise<
//     CategoryWithSubcategories[]
//   > => {
//     try {
//       const categoriesResponse = await fetch(
//         'https://profiback.itest24.com/api/sections',
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${'123'}`,
//           },
//         },
//       );
//       const categories: Category[] = await categoriesResponse.json();

//       const categoriesWithSubcategoriesContent = await Promise.all(
//         categories.map(async (category) => {
//           try {
//             const subCategoriesResponse = await fetch(
//               `https://profiback.itest24.com/api/subsections?section_id=${category.id}`,
//               {
//                 headers: {
//                   'Content-Type': 'application/json',
//                   Authorization: `Bearer ${'123'}`,
//                 },
//               },
//             );
//             const subCategories: SubCategory[] =
//               await subCategoriesResponse.json();

//             const subCategoriesWithServices = await Promise.all(
//               subCategories.map(async (subCategory) => {
//                 try {
//                   const servicesResponse = await fetch(
//                     `https://profiback.itest24.com/api/services/?subsection_id=${subCategory.id}&section_id=${category.id}`,
//                     {
//                       headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${'123'}`,
//                       },
//                     },
//                   );
//                   const services: Service[] = await servicesResponse.json();
//                   return {
//                     sub_category: subCategory.name,
//                     services,
//                   };
//                 } catch (error) {
//                   console.error('Error fetching services:', error);
//                   return { sub_category: subCategory.name, services: [] };
//                 }
//               }),
//             );

//             return {
//               category: category.name,
//               sub_categories: subCategoriesWithServices,
//             };
//           } catch (error) {
//             console.error('Error fetching subcategories:', error);
//             return null;
//           }
//         }),
//       );
//       return categoriesWithSubcategoriesContent.filter(
//         (category) => category !== null,
//       ) as CategoryWithSubcategories[];
//     } catch (error) {
//       console.error(error);
//       return [];
//     }
//   }, []);

//   useEffect(() => {
//     fetchServices().then(setDropdownContent);
//   }, [fetchServices]);

//   return (
//     <Dropdown
//       title={
//         <>
//           <span>Услуги</span>
//           <img
//             src={arrowDown}
//             alt=""
//             style={{
//               transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
//               transition: 'transform 1s ease',
//               marginLeft: '5px',
//             }}
//           />
//         </>
//       }
//       isActive={isOpen}
//       menuClassName={styles.serviceDropdown}
//       wrapperClassName={styles.serviceDropdown_wrapper}
//       buttonClassName={styles.serviceDropdown_button}
//       onClick={() => setIsOpen(!isOpen)}
//       position="left"
//       openOnHover={true}
//     >
//       {/* 1 lvl */}
//       {dropdownContent.map((categoryContent, index) => (
//         <div key={index} className={styles.serviceDropdown_lvl1}>
//           <Dropdown.Item className={`${styles.serviceDropdown_item_lvl1}`}>
//             <span className={styles.serviceDropdown_lvl1__span}>
//               {/* <img
//                 style={{ height: '22px' }}
//                 src="/img/microshema.png"
//                 alt=""
//               /> */}
//               <p>{categoryContent.category}</p>
//             </span>

//             {/* 2 lvl */}
//             <Dropdown.Submenu
//               position="right-top"
//               className={styles.Submenu_submenu}
//             >
//               {categoryContent.sub_categories.map(
//                 (subCategoryContent, subIndex) => (
//                   <Dropdown.Item
//                     className={styles.serviceDropdown_item}
//                     key={subIndex}
//                   >
//                     <span className={styles.serviceDropdown_item_menu}>
//                       {subCategoryContent.sub_category}
//                     </span>

//                     {/* 3 lvl */}
//                     <Dropdown.Submenu
//                       position="right-top"
//                       className={styles.Submenu_submenu_lvl3}
//                     >
//                       {subCategoryContent.services.map(
//                         (service, serviceIndex) => (
//                           <Dropdown.Item
//                             className={`${styles.serviceDropdown_item} ${styles.serviceDropdown_item_lvl3}`}
//                             key={serviceIndex}
//                           >
//                             <Link to={`/devices/${service.id}`}>
//                               <span>{service.name}</span>
//                             </Link>
//                           </Dropdown.Item>
//                         ),
//                       )}
//                     </Dropdown.Submenu>
//                   </Dropdown.Item>
//                 ),
//               )}
//             </Dropdown.Submenu>
//           </Dropdown.Item>
//         </div>
//       ))}
//     </Dropdown>
//   );
// };

// export default ServiceDropdown;
