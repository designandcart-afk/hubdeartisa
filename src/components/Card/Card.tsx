import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover';
  padding?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  onClick,
}: CardProps) {
  const className = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    onClick ? styles.clickable : '',
  ].join(' ');

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}
