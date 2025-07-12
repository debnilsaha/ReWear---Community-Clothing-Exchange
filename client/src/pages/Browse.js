import { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Browse() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    type: '',
    condition: '',
    tags: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await axios.get('/items', { params });
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchItems();
  };

  const handleReset = () => {
    setFilters({
      category: '',
      size: '',
      type: '',
      condition: '',
      tags: ''
    });
    fetchItems();
  };

  return (
    <Container className="mt-5">
      <h2>Browse Items</h2>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={2}>
          <Form.Select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            name="size"
            value={filters.size}
            onChange={handleFilterChange}
          >
            <option value="">Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">Type</option>
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="accessories">Accessories</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            name="condition"
            value={filters.condition}
            onChange={handleFilterChange}
          >
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="gently used">Gently Used</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control
            placeholder="Tags (comma separated)"
            name="tags"
            value={filters.tags}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={2}>
          <Button variant="success" onClick={handleApplyFilters}>
            Apply
          </Button>{' '}
          <Button variant="outline-secondary" onClick={handleReset}>
            Reset
          </Button>
        </Col>
      </Row>

      {/* Items Grid */}
      <Row>
        {items.length === 0 && <p>No items found.</p>}
        {items.map(item => (
          <Col md={4} key={item._id} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`http://localhost:8080/${item.images[0]}`}
                height="200"
                style={{ objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <Button
                  as={Link}
                  to={`/item/${item._id}`}
                  variant="primary"
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
