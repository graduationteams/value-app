import { useState } from 'react';
import { api } from '~/utils/api'; // Adjust the import path based on your setup

function TestAddressCRUD() {
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [addressId, setAddressId] = useState('');

  const createAddressMutation = api.address.create.useMutation();
  const getAddressQuery = api.address.get.useQuery({ id: addressId }, { enabled: false });
  const editAddressMutation = api.address.edit.useMutation();
  const deleteAddressMutation = api.address.delete.useMutation();

  const createAddress = () => {
    createAddressMutation.mutate({ city, lat, lng }, {
      onSuccess: (data) => {
        setAddressId(data.id);
        alert('Address created successfully');
      },
    });
  };

  const editAddress = () => {
    editAddressMutation.mutate({ id: addressId, city, lat, lng }, {
      onSuccess: () => {
        alert('Address updated successfully');
      },
    });
  };

  const deleteAddress = () => {
    deleteAddressMutation.mutate({ id: addressId }, {
      onSuccess: () => {
        setAddressId('');
        alert('Address deleted successfully');
      },
    });
  };

  return (
    <div>
      <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
      <input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />

      <button onClick={createAddress}>Create Address</button>
      {addressId && (
        <>
          <button onClick={() => getAddressQuery.refetch()}>Get Address</button>
          <button onClick={editAddress}>Edit Address</button>
          <button onClick={deleteAddress}>Delete Address</button>
        </>
      )}
    </div>
  );
}

export default TestAddressCRUD;
