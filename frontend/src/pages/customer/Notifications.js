import React from 'react';
import CustomerLayout from './CustomerLayout';
import CustomerNotifications from '../../components/CustomerNotifications';

const CustomerNotificationsPage = () => {
  return (
    <CustomerLayout>
      <CustomerNotifications />
    </CustomerLayout>
  );
};

export default CustomerNotificationsPage;
