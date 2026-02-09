import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  multiline = false,
  rows = 4,
  error,
}: InputProps) {
  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className={`${styles.input} ${error ? styles.error : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
