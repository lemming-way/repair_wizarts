// import React, { useState } from 'react';
// import Dropdown from 'react-multilevel-dropdown';
// import arrowDown from '../../../../img/header/icons/arrow-down-icon.svg';
// import styles from './ServiceDropdown.module.scss';
// import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const ServiceDropdown = () => {
//   const { categories } = useSelector((state) => state.categories);
//   const menu: string[] = [
//     'Ремонт телефонов',
//     'Ремонт планшетов',
//     'Ремонт ноутбуков',
//     'Ремонт компьютеров',
//     'Ремонт часов',
//     'Аксессуары',
//   ];
//   const submenuData: string[] = [
//     'Ремонт iPhone',
//     'Ремонт iPad',
//     'Ремонт MacBook',
//   ];

//   const [isOpen, setIsOpen] = useState(false);

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
//       <div className={styles.serviceDropdown_lvl1}>
//         {/* <div className={styles.lvl1_row}>
//       <img src="/img/microshema.png" alt="" />
//       <p>электроника</p>
//     </div> */}
//         <Dropdown.Item className={` ${styles.serviceDropdown_item_lvl1}`}>
//           <span className={styles.serviceDropdown_lvl1__span}>
//             <img style={{ height: '22px' }} src="/img/microshema.png" alt="" />
//             <p>электроника</p>
//           </span>
//           {/* 2lvl */}
//           <Dropdown.Submenu
//             position="right-top"
//             className={styles.Submenu_submenu}
//           >
//             {menu.map((menu, index) => (
//               <Dropdown.Item
//                 className={styles.serviceDropdown_item}
//                 key={index}
//               >
//                 <span className={styles.serviceDropdown_item_menu}>{menu}</span>

//                 {/* 3lvl */}
//                 <Dropdown.Submenu
//                   position="right-top"
//                   className={styles.Submenu_submenu_lvl3}
//                 >
//                   {submenuData.map((submenu, index) => (
//                     <Dropdown.Item
//                       className={`${styles.serviceDropdown_item} ${styles.serviceDropdown_item_lvl3}`}
//                       key={index}
//                     >
//                       <Link to="/devices/1">
//                         <span>{submenu}</span>
//                       </Link>
//                     </Dropdown.Item>
//                   ))}
//                 </Dropdown.Submenu>
//               </Dropdown.Item>
//             ))}
//           </Dropdown.Submenu>
//         </Dropdown.Item>

//         <div className={styles.lvl1_row}>
//           <p>Мастера по ремонту</p>
//         </div>
//       </div>
//     </Dropdown>
//   );
// };

// export default ServiceDropdown;
import { useState } from 'react';
import Dropdown from 'react-multilevel-dropdown';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './ServiceDropdown.module.scss';
import arrowDown from '../../../../img/header/icons/arrow-down-icon.svg';
import type { RootState } from '../../../../store';

const ServiceDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { categories } = useSelector((state: RootState) => state.categories);
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
      {categories?.map((categoryContent, index) => (
        <div key={index} className={styles.serviceDropdown_lvl1}>
          <Dropdown.Item className={styles.serviceDropdown_item_lvl1}>
            <span className={styles.serviceDropdown_lvl1__span}>
              <p>{categoryContent.name}</p>
            </span>

            {/* 2 lvl */}
            <Dropdown.Submenu
              position="right-top"
              className={styles.Submenu_submenu}
            >
              {categoryContent.subsections.map(
                (subCategoryContent, subIndex) => (
                  <Dropdown.Item
                    className={styles.serviceDropdown_item}
                    key={subIndex}
                  >
                    <Link
                      to={`/devices/${categoryContent.id}/${subCategoryContent.id}`}
                    >
                      <span>{subCategoryContent.name}</span>
                    </Link>
                    <Dropdown.Submenu
                      position="right-top"
                      className={styles.Submenu_submenu}
                    >
                      {subCategoryContent.services
                        .slice(0, 5)
                        .map((service, serviceIndex) => (
                          <Dropdown.Item
                            className={`${styles.serviceDropdown_item} ${styles.serviceDropdown_item_lvl3}`}
                            key={serviceIndex}
                          >
                            <Link
                              to={`/devices/${categoryContent.id}/${subCategoryContent.id}`}
                            >
                              <span>{service.name}</span>
                            </Link>
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Submenu>
                  </Dropdown.Item>
                ),
              )}
            </Dropdown.Submenu>
          </Dropdown.Item>
        </div>
      ))}
    </Dropdown>
  );
};

export default ServiceDropdown;
