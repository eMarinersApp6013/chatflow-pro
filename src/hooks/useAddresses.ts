// useAddresses — CRUD hook for the addresses WatermelonDB table.

import { useState, useEffect, useCallback } from 'react';
import { database, addressesCollection } from '../db/database';
import type AddressModel from '../db/models/AddressModel';

export interface AddressInput {
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<AddressModel[]>([]);

  useEffect(() => {
    const sub = addressesCollection
      .query()
      .observe()
      .subscribe({ next: (records) => setAddresses(records as AddressModel[]) });
    return () => sub.unsubscribe();
  }, []);

  const addAddress = useCallback(async (input: AddressInput): Promise<void> => {
    const now = Date.now();
    await database.write(async () => {
      // If this is marked as default, clear other defaults first
      if (input.isDefault) {
        const existing = await addressesCollection.query().fetch();
        for (const addr of existing) {
          if ((addr as AddressModel).isDefault) {
            await (addr as AddressModel).update((a) => { a.isDefault = false; });
          }
        }
      }
      await addressesCollection.create((record) => {
        record.label = input.label;
        record.name = input.name;
        record.phone = input.phone;
        record.line1 = input.line1;
        record.line2 = input.line2 ?? null;
        record.city = input.city;
        record.state = input.state;
        record.pincode = input.pincode;
        record.country = input.country || 'India';
        record.isDefault = input.isDefault ?? false;
        record.createdAt = now;
      });
    });
  }, []);

  const deleteAddress = useCallback(async (addressId: string): Promise<void> => {
    try {
      const addr = await addressesCollection.find(addressId) as AddressModel;
      await database.write(async () => {
        await addr.destroyPermanently();
      });
    } catch {
      // Record not found — nothing to delete
    }
  }, []);

  const setDefaultAddress = useCallback(async (addressId: string): Promise<void> => {
    await database.write(async () => {
      const records = await addressesCollection.query().fetch();
      for (const record of records) {
        const addr = record as AddressModel;
        await addr.update((a) => { a.isDefault = a.id === addressId; });
      }
    });
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return { addresses, defaultAddress, addAddress, deleteAddress, setDefaultAddress };
}
