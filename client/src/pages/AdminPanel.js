import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Container, Button, Card } from 'react-bootstrap';

export default function AdminPanel() {
  const [items, setItems] = useState([]);

  const fetchItems = () => {
    axios.get('/items').then(res => setItems(res.data));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const deleteItem = (id) => {
    const token = localStorage.getItem('token');
    axios.delete(`/admin/item/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert('Deleted!');
      fetchItems();
    });
  };

  return (
    <Container className="mt-5">
      <h2>Admin Panel</h2>
      {items.map(item => (
        <Card key={item._id} className="mb-3">
          <Card.Body>
            <Card.Title>{item.title}</Card.Title>
            <Button variant="danger" onClick={() => deleteItem(item._id)}>Delete</Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
