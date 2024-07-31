'use client'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export default function Home() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [newItem, setNewItem] = useState({ name: '', price: '' });

    useEffect(() => {
        const newTotal = items.reduce((acc, item) => acc + parseFloat(item.price), 0);
        setTotal(newTotal);
    }, [items]);

    const addItem = async (e) => {
        e.preventDefault();
        if (newItem.name !== '' && newItem.price !== '') {
            try {
                await addDoc(collection(db, 'items'), {
                    name: newItem.name.trim(),
                    price: newItem.price
                });
                setNewItem({ name: '', price: '' });
            } catch (error) {
                console.error('Error adding item: ', error);
            }
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'items'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let itemsArr = [];
            querySnapshot.forEach((doc) => {
                itemsArr.push({ ...doc.data(), id: doc.id });
            });
            setItems(itemsArr);
        });

        return () => unsubscribe(); 
    }, []);

    const deleteItem = async (id) => {
        if (id) {
            try {
                console.log('Deleting item with ID:', id); 
                await deleteDoc(doc(db, 'items', id));
            } catch (error) {
                console.error('Error deleting item: ', error);
            }
        } else {
            console.error('Item ID is undefined or null');
        }
    };

    return (
        <main className='flex min-h-screen flex-col items-center justify-between bg-slate-900 sm:p-24 p-4'>
            <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm text-white'>
                <h1 className='text-4xl p-4 text-center my-4 text-white'>Expense Tracker</h1>
                <div className='bg-gray-700 p-6 rounded-lg shadow-lg'>
                    <form className='grid grid-cols-6 items-center text-black mb-4' onSubmit={addItem}>
                        <input
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            value={newItem.name}
                            className='col-span-3 p-3 mx-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                            type='text'
                            placeholder='Enter Item'
                        />
                        <input
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            value={newItem.price}
                            className='col-span-2 p-3 mx-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                            type='number'
                            placeholder='Enter ₹'
                        />
                        <button className='text-white bg-green-600 hover:bg-green-500 p-3 rounded-lg text-xl max-h-12' type='submit'>
                            +
                        </button>
                    </form>
                    <ul className='space-y-4'>
                        {items.map((item) => (
                            <li key={item.id} className='flex justify-between items-center text-white p-4 rounded-lg shadow-md bg-gray-800'>
                                <div className='w-full flex justify-between items-center'>
                                    <span className='capitalize'>{item.name}</span>
                                    <span>₹ {item.price}</span>
                                </div>
                                <button 
                                    onClick={() => deleteItem(item.id)} 
                                    className='rounded-lg ml-10 px-5 p-2 bg-red-600 hover:bg-red-500'
                                >
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                    {items.length > 0 && (
                        <div className='flex justify-between items-center mt-4 p-4 rounded-lg shadow-md text-white bg-gray-800'>
                            <span className='font-semibold'>Total</span>
                            <span>₹ {total}</span>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
