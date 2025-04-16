import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    partNumber: '',
    description: '',
    originalPrice: '',
    priceWithGST: '',
    stock: '',
  });
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState(null);

  const fetchProducts = () => {
    fetch(`http://localhost:5000/products?search=${search}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = { ...form, originalPrice: Number(form.originalPrice), priceWithGST: Number(form.priceWithGST), stock: Number(form.stock) };
    const res = await fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    const saved = await res.json();
    setProducts([...products, saved]);
    setForm({ partNumber: '', description: '', originalPrice: '', priceWithGST: '', stock: '' });
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p._id !== id));
  };

  const handleEdit = (product) => {
    setEditForm({ ...product });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = { ...editForm, originalPrice: Number(editForm.originalPrice), priceWithGST: Number(editForm.priceWithGST), stock: Number(editForm.stock) };
    const res = await fetch(`http://localhost:5000/products/${editForm._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const result = await res.json();
    setProducts(products.map(p => (p._id === result._id ? result : p)));
    setEditForm(null);
  };

  return (
    <div className="container">
      <h1>Inventory Management</h1>
      <input
        type="text"
        placeholder="Search by part number or description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      <form onSubmit={handleSubmit} className="form">
        {['partNumber', 'description', 'originalPrice', 'priceWithGST', 'stock'].map(field => (
          <input key={field} name={field} value={form[field]} onChange={handleChange} placeholder={field} required />
        ))}
        <button type="submit">Add Product</button>
      </form>

      <ul className="product-list">
        {products.map(product => (
          <li key={product._id} className="product-item">
            {editForm && editForm._id === product._id ? (
              <form onSubmit={handleEditSubmit} className="form">
                {['partNumber', 'description', 'originalPrice', 'priceWithGST', 'stock'].map(field => (
                  <input
                    key={field}
                    name={field}
                    value={editForm[field]}
                    onChange={handleEditChange}
                    required
                  />
                ))}
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditForm(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <p><strong>{product.description}</strong> (Part #{product.partNumber})</p>
                <p>Original: ₹{product.originalPrice} | With GST: ₹{product.priceWithGST}</p>
                <p>Stock: {product.stock}</p>
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Remove</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;