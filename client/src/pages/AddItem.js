import { useState } from 'react';
import axios from '../api/axios';
import { Container, Form, Button } from 'react-bootstrap';

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
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
      alert('Item listed!');
    } catch (e) {
      alert(e.response?.data?.msg || 'Error');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Add New Item</h2>
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
          <Form.Control name="category" value={form.category} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Control name="type" value={form.type} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Size</Form.Label>
          <Form.Control name="size" value={form.size} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Condition</Form.Label>
          <Form.Control name="condition" value={form.condition} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control name="tags" value={form.tags} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Images</Form.Label>
          <Form.Control type="file" multiple onChange={e => setImages(e.target.files)} />
        </Form.Group>
        <Button onClick={handleSubmit}>Add Item</Button>
      </Form>
    </Container>
  );
}
