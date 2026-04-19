import React, { useState, useCallback, useMemo } from 'react';
import { TimeUnit } from 'app/state/user';
import { useLanguage } from 'app/state/language';
import style from './Services.module.css';

const ServiceDetailItem = ({ serviceDetail, index, onUpdate, onDelete }) => {
    const text = useLanguage();
    const [localServiceDetail, setLocalServiceDetail] = useState(serviceDetail);

    const handleFieldChange = useCallback((field, value) => {
        setLocalServiceDetail(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDurationChange = useCallback((type, field, value) => {
        setLocalServiceDetail(prev => ({
            ...prev,
            [type]: {
                ...(prev[type] || {}),
                [field]: value
            }
        }));
    }, []);

    const unitOptions = useMemo(() => ([
        { value: TimeUnit.MINUTES, label: text('minutes') },
        { value: TimeUnit.HOURS, label: text('hours') },
        { value: TimeUnit.DAYS, label: text('days') },
        { value: TimeUnit.WEEKS, label: text('weeks') },
    ]), [text]);

    const handleSave = () => {
        onUpdate(index, localServiceDetail);
    };

    const handleDelete = () => {
        onDelete(index);
    };

    return (
        <li className={style.serviceListItem}>
            <input
                type="text"
                className={style.inputField}
                placeholder={text('Service Name')}
                value={localServiceDetail.service}
                onChange={(e) => handleFieldChange('service', e.target.value)}
            />
            <input
                type="number"
                className={style.inputField}
                placeholder={text('Duration From Value')}
                value={localServiceDetail.durationFrom.value}
                onChange={(e) => handleDurationChange('durationFrom', 'value', Number(e.target.value))}
            />
            <select
                className={`${style.selectField} ${style.unitSelect}`}
                value={localServiceDetail.durationFrom.unit}
                onChange={(e) => handleDurationChange('durationFrom', 'unit', e.target.value)}
            >
                {unitOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <input
                type="number"
                className={style.inputField}
                placeholder={text('Duration To Value (optional)')}
                value={localServiceDetail.durationTo?.value || ''}
                onChange={(e) => handleDurationChange('durationTo', 'value', Number(e.target.value) || undefined)}
            />
            <select
                className={`${style.selectField} ${style.unitSelect}`}
                value={localServiceDetail.durationTo?.unit || ''}
                onChange={(e) => handleDurationChange('durationTo', 'unit', e.target.value || undefined)}
            >
                <option value="" disabled>{text('Unit (optional)')}</option>
                {unitOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <input
                type="number"
                className={style.inputField}
                placeholder={text('Price')}
                value={localServiceDetail.price}
                onChange={(e) => handleFieldChange('price', Number(e.target.value))}
            />
            <div className={style.serviceListItemButtons}>
                <button type="button" className={style.serviceListItemButton} onClick={handleSave}>
                    {text('Save')}
                </button>
                <button type="button" className={`${style.serviceListItemButton} ${style.delete}`} onClick={handleDelete}>
                    {text('Delete')}
                </button>
            </div>
        </li>
    );
};

export default ServiceDetailItem;
