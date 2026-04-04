import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser, useUpdateUser, TimeUnit } from 'app/state/user';
import { useOfferings } from 'app/state/site-data';
import { useLanguage } from 'app/state/language';
import ServiceDetailItem from './ServiceDetailItem';
import style from './Services.module.css';

const defaultServiceDetail = {
    service: '',
    durationFrom: {
        value: 1,
        unit: TimeUnit.HOURS
    },
    price: 0
};

function Services() {
    const text = useLanguage();
    const queryClient = useQueryClient();
    const { user, isSuccess: isUserLoaded, isLoading: isUserLoading } = useUser();
    const { save: saveUserProfile, isPending: isSavingUserProfile } = useUpdateUser();
    const { offerings: allOfferings } = useOfferings();

    const [selectedOfferingId, setSelectedOfferingId] = useState(0);
    const [editingServices, setEditingServices] = useState({}); // Map of offeringId to ServiceDetails[]
    const [succeeded, setSucceeded] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = text('Services Settings');
    }, [text]);

    useEffect(() => {
        if (isUserLoaded && user.id && user.services) {
            // Deep copy to ensure local state is mutable and independent
            const userServicesCopy = Object.entries(user.services).reduce((acc, [offeringId, details]) => {
                acc[Number(offeringId)] = details.map(detail => ({ ...detail }));
                return acc;
            }, {});
            setEditingServices(userServicesCopy);

            // Set initial selected offering if there are any
            const firstOfferingId = Object.keys(userServicesCopy)[0];
            if (firstOfferingId) {
                setSelectedOfferingId(Number(firstOfferingId));
            }
        }
    }, [isUserLoaded, user]);

    const offeringOptions = useMemo(() => {
        if (!user.services || !Object.keys(user.services).length) {
            return [];
        }
        return Object.keys(user.services)
            .filter(id => allOfferings[id]) // Only include offerings that exist in site data
            .map(id => ({
                value: Number(id),
                label: allOfferings[id].name
            }));
    }, [user.services, allOfferings]);

    const currentServiceDetails = editingServices[selectedOfferingId] || [];

    const handleSelectOffering = useCallback((e) => {
        setSelectedOfferingId(Number(e.target.value));
    }, []);

    const handleAddServiceDetail = useCallback(() => {
        if (!selectedOfferingId) return;

        setEditingServices(prev => ({
            ...prev,
            [selectedOfferingId]: [
                ...(prev[selectedOfferingId] || []),
                { ...defaultServiceDetail }
            ]
        }));
    }, [selectedOfferingId]);

    const handleUpdateServiceDetail = useCallback((index, updatedDetail) => {
        if (!selectedOfferingId) return;

        setEditingServices(prev => {
            const newDetails = [...(prev[selectedOfferingId] || [])];
            newDetails[index] = updatedDetail;
            return {
                ...prev,
                [selectedOfferingId]: newDetails
            };
        });
    }, [selectedOfferingId]);

    const handleDeleteServiceDetail = useCallback((index) => {
        if (!selectedOfferingId) return;

        setEditingServices(prev => {
            const newDetails = (prev[selectedOfferingId] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                [selectedOfferingId]: newDetails
            };
        });
    }, [selectedOfferingId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSucceeded('');
        setError('');

        if (isUserLoading || isSavingUserProfile) return;

        try {
            await saveUserProfile({ services: editingServices }, { client: queryClient });
            setSucceeded('services');
        } catch (err) {
            setError(err.message || text('An error occurred while saving services data'));
        }
    };

    if (!isUserLoaded || user.role !== 2) { // Only show for contractors
        return null;
    }

    return (
        <div className={style.services_wrap}>
            <h3 className={style.heading}>{text('Edit Services')}</h3>

            {succeeded === 'services' && (
                <div className={`${style.alert} ${style.successMessage}`}>
                    {text('Services updated successfully')}
                </div>
            )}
            {error && (
                <div className={`${style.alert} ${style.errorMessage}`}>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className={style.form}>
                <select
                    className={style.selectField}
                    value={selectedOfferingId}
                    onChange={handleSelectOffering}
                    disabled={!offeringOptions.length}
                >
                    <option value="0" disabled>{text('Select a service offering')}</option>
                    {offeringOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                {selectedOfferingId !== 0 && (
                    <>
                        <ul className={style.serviceList}>
                            {currentServiceDetails.length > 0 ? (
                                currentServiceDetails.map((detail, index) => (
                                    <ServiceDetailItem
                                        key={`${selectedOfferingId}-${index}`}
                                        serviceDetail={detail}
                                        index={index}
                                        onUpdate={handleUpdateServiceDetail}
                                        onDelete={handleDeleteServiceDetail}
                                    />
                                ))
                            ) : (
                                <p>{text('No services added for this offering yet. Add one below.')}</p>
                            )}
                        </ul>
                        <button
                            type="button"
                            className={`${style.button} ${style.addServiceButton}`}
                            onClick={handleAddServiceDetail}
                        >
                            {text('Add Service')}
                        </button>
                    </>
                )}

                <button type="submit" className={`${style.button} ${style.saveButton}`} disabled={isSavingUserProfile}>
                    {isSavingUserProfile ? text('Saving...') : text('Save Changes')}
                </button>
            </form>
        </div>
    );
}

export default Services;
