/* eslint-disable */
'use client';
import { useEffect, useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/social_network/api/notifications/')
      .then(res => res.json())
      .then(setNotifications);
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <h5>Notifications</h5>
        <ul className="list-group">
          {notifications.map(notification => (
            <li key={notification.id} className="list-group-item">
              {notification.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}