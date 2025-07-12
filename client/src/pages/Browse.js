import { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
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
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    // Fetch user profile if logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await axios.get('/items', { params });
      console.log('Browse items response:', res.data); // Debug log
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

  // Swap Request handler
  const handleSwapRequest = async (itemId) => {
    setLoadingId(itemId);
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to request a swap.');
      setLoadingId(null);
      return;
    }
    try {
      await axios.post(`/items/${itemId}/swap-request`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Swap request sent!');
      fetchItems();
    } catch (e) {
      setMessage(e.response?.data?.msg || 'Error sending swap request.');
    }
    setLoadingId(null);
  };

  // Redeem via Points handler
  const handleRedeem = async (itemId) => {
    setLoadingId(itemId);
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to redeem items.');
      setLoadingId(null);
      return;
    }
    try {
      await axios.post(`/items/${itemId}/redeem`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Item redeemed via points!');
      fetchItems();
    } catch (e) {
      setMessage(e.response?.data?.msg || 'Error redeeming item.');
    }
    setLoadingId(null);
  };

  return (
    <Container className="mt-5">
      <h2>Browse Items</h2>
      {message && <Alert variant="info">{message}</Alert>}

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
        {items.map(item => {
          const isUploader = user && item.uploader && item.uploader._id === user._id;
          const isAvailable = item.status === 'available';
          return (
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
                  <Card.Text>
                    Redeem for: <strong>15 points</strong><br />
                    Estimated value: <strong>10–15 points</strong>
                  </Card.Text>
                  <div className="mb-2">
                    <span>Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  </div>
                  <Button
                    as={Link}
                    to={`/item/${item._id}`}
                    variant="primary"
                    className="me-2"
                  >
                    View Details
                  </Button>
                  {!isUploader && isAvailable && (
                    <>
                      <Button
                        variant="success"
                        className="me-2"
                        disabled={loadingId === item._id}
                        onClick={() => handleSwapRequest(item._id)}
                      >
                        {loadingId === item._id ? 'Requesting...' : 'Swap Request'}
                      </Button>
                      <Button
                        variant="warning"
                        disabled={loadingId === item._id}
                        onClick={() => handleRedeem(item._id)}
                      >
                        {loadingId === item._id ? 'Processing...' : 'Redeem via Points'}
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
