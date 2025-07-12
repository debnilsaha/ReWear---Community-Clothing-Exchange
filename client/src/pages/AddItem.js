import { useState } from 'react';
import axios from '../api/axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

export default function AddItem() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));
    for (let i = 0; i < images.length; i++) {
      fd.append('images', images[i]);
    }
    try {
      await axios.post('/items', fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setForm({
        title: '',
        description: '',
        category: '',
        type: '',
        size: '',
        condition: '',
        tags: '',
      });
      setImages([]);
    } catch (e) {
      alert(e.response?.data?.msg || 'Error');
    }
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <h2>Add New Item</h2>
      {success && <Alert variant="info">Your item has been added and is now live!</Alert>}
      <Alert variant="info">You will earn <strong>10 points</strong> for each item you upload!</Alert>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={form.title} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select name="category" value={form.category} onChange={handleChange}>
            <option value="">Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="t-shirt">T-shirt</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Select name="type" value={form.type} onChange={handleChange}>
            <option value="">Type</option>
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="accessories">Accessories</option>
            <option value="t-shirt">T-shirt</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Size</Form.Label>
          <Form.Select name="size" value={form.size} onChange={handleChange}>
            <option value="">Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Condition</Form.Label>
          <Form.Select name="condition" value={form.condition} onChange={handleChange}>
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="gently used">Gently Used</option>
            <option value="Good">Good</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control name="tags" value={form.tags} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Images</Form.Label>
          <Form.Control type="file" multiple onChange={e => setImages(e.target.files)} />
        </Form.Group>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Add Item'}</Button>
      </Form>
    </Container>
  );
}
