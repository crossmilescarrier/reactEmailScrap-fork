import React from 'react';
import AddAccount from './AddAccount';
import { IoMdAdd } from 'react-icons/io';

export default function AddCarrierAccount({ item, fetchLists, classes }) {
  return (
    <AddAccount
      item={item}
      fetchLists={fetchLists}
      accountType="carrier"
      classes={classes || "btn bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"}
      text={
        <>
          <IoMdAdd className="me-1 sm:me-2" size={18}/> 
          <span className="hidden sm:inline">Add New </span>Carrier
        </>
      }
    />
  );
}
