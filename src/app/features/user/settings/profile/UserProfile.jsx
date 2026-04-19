import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useLanguage } from 'app/state/language';
import { fileToBase64 } from 'app/shared/lib/utilities';
import { useUser, useUpdateUser, useUpdateUserAvatar, useUpdateUserPassword } from 'app/state/user';
import { PhoneNumber, correctPhoneNumber } from '../../PhoneNumber';
import style from './UserProfile.module.css';

function UserProfile() {
  const text = useLanguage();
  const queryClient = useQueryClient();
  const { user, isSuccess: isUserLoaded } = useUser();
  const { save: saveUserProfile, isPending: isSavingUserProfile } = useUpdateUser();
  const { save: saveUserAvatar, isPending: isSavingUserAvatar } = useUpdateUserAvatar();
  const { update: updatePassword, isPending: isUpdatingPassword } = useUpdateUserPassword();

  const [succeeded, setSucceeded] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const [mainForm, setMainForm] = useState({
    name: '',
    lastname: '',
    phone: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [visibleOldPassword, setVisibleOldPassword] = useState(false);
  const [visibleNewPassword, setVisibleNewPassword] = useState(false);

  useEffect(() => {
    if (isUserLoaded && user.id) {
      setMainForm((prev) => ({
        ...prev,
        name: user.name || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
      setPreviewUrl(user.avatar || '');
    }
  }, [user, isUserLoaded]);

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  if (!user.id) {
    return null;
  }

  const handleMainFormChange = (e) => {
    const { name, value } = e.target;
    setMainForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneNumberChange = (value) => {
    setMainForm((prev) => ({ ...prev, phone: correctPhoneNumber(value) }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const onMainFormSubmit = async (e) => {
    e.preventDefault();
    setSucceeded('');
    setError('');

    try {
      await saveUserProfile(mainForm, { client: queryClient });
      setSucceeded('profile');
    } catch (err) {
      setError(err.message || text('An error occurred while saving profile data'));
    }
  };

  const onPasswordFormSubmit = async (e) => {
    e.preventDefault();
    setSucceeded('');
    setError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setError(text('Please fill in both current and new password fields'));
      return;
    }

    try {
      await updatePassword(
        { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
        { client: queryClient }
      );
      setSucceeded('password');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message || text('An error occurred while changing password'));
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
    }
  };

  const onAvatarUpload = async (e) => {
    e.preventDefault();
    setSucceeded('');
    setError('');

    const fileInput = e.target.elements.profileLogoUpload;
    const file = fileInput.files?.[0];

    if (!file) {
      setError(text('No file selected'));
      return;
    }
    try {
      await saveUserAvatar(file, { client: queryClient });
      setSucceeded('avatar');
      fileInput.value = '';
    } catch (err) {
      setError(err.message || text('An error occurred while uploading avatar'));
    }
  };

  return (
    <div className={style.settingsContainer}>
      {succeeded === 'profile' && (
        <div className={`succeed-v ${style.successMessage}`}>
          {text('Profile data updated successfully')}
        </div>
      )}
      {succeeded === 'password' && (
        <div className={`succeed-v ${style.successMessage}`}>
          {text('Password updated successfully')}
        </div>
      )}
      {succeeded === 'avatar' && (
        <div className={`succeed-v ${style.successMessage}`}>
          {text('Avatar updated successfully')}
        </div>
      )}
      {error && (
        <div className={`auth-err ${style.errorMessage}`}>
          {error}
        </div>
      )}

      <div className={style.profileSection}>
        <div className={style.avatarUploadBlock}>
          <label htmlFor="profileLogoUpload">
            <img
              src={previewUrl || '/img/img-camera.png'}
              alt={text('Avatar')}
              className={style.profilePicture}
            />
          </label>
          <form onSubmit={onAvatarUpload}>
            <input
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: 'none' }}
              onChange={handleAvatarFileChange}
              id="profileLogoUpload"
              name="profileLogoUpload"
            />
            <button type="submit" className={style.editAvatarButton}>
              {isSavingUserAvatar ? text('Uploading...') : text('Edit Avatar')}
            </button>
          </form>
        </div>

        <form onSubmit={onMainFormSubmit} className={style.mainForm}>
          <div className={style.formRow}>
            <input
              type="text"
              placeholder={text('Name')}
              name="name"
              value={mainForm.name}
              onChange={handleMainFormChange}
              required
            />
            <input
              type="text"
              placeholder={text('Lastname')}
              name="lastname"
              value={mainForm.lastname}
              onChange={handleMainFormChange}
              required
            />
          </div>
          <div className={style.formRow}>
            <PhoneNumber
              value={mainForm.phone}
              onChange={handlePhoneNumberChange}
              placeholder={text('Phone number')}
              className={style.inputField}
            />
            <input
              type="email"
              placeholder={text('Email')}
              name="email"
              value={mainForm.email}
              onChange={handleMainFormChange}
              required
            />
          </div>

          <button type="submit" className={style.saveButton}>
            {isSavingUserProfile ? text('Saving...') : text('Save Profile')}
          </button>
        </form>
      </div>

      <div className={style.passwordChangeSection}>
        <h3>{text('Change Password')}</h3>
        <form onSubmit={onPasswordFormSubmit} className={style.passwordForm}>
          <div className={style.inputWrap}>
            <input
              type={visibleOldPassword ? 'text' : 'password'}
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordFormChange}
              placeholder={text('Current password')}
              required
            />
            <img
              src={visibleOldPassword ? '/img/icons/eye_open.png' : '/img/icons/eye_close.png'}
              alt={text('Toggle password visibility')}
              className={style.passwordIcon}
              onClick={() => setVisibleOldPassword((prev) => !prev)}
            />
          </div>
          <div className={style.inputWrap}>
            <input
              type={visibleNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              placeholder={text('New password')}
              required
            />
            <img
              src={visibleNewPassword ? '/img/icons/eye_open.png' : '/img/icons/eye_close.png'}
              alt={text('Toggle password visibility')}
              className={style.passwordIcon}
              onClick={() => setVisibleNewPassword((prev) => !prev)}
            />
          </div>
          <button type="submit" className={style.saveButton}>
            {isUpdatingPassword ? text('Updating...') : text('Change Password')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
