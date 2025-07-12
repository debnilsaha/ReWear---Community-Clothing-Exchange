import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Table,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [swappedItems, setSwappedItems] = useState([]);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [swapRequests, setSwapRequests] = useState([]);
  const [swapMessage, setSwapMessage] = useState('');
  const [mySwapRequests, setMySwapRequests] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // get user profile
        const profileRes = await axios.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(profileRes.data);
        // get user's own items
        const itemsRes = await axios.get('/items/mine', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUserItems(itemsRes.data);
        // get swapped and redeemed items (populate from user profile)
        const swapped = [];
        const redeemed = [];
        if (profileRes.data.swappedItems && profileRes.data.swappedItems.length > 0) {
          for (let itemId of profileRes.data.swappedItems) {
            const res = await axios.get(`/items/${itemId}`);
            swapped.push(res.data);
          }
        }
        if (profileRes.data.redeemedItems && profileRes.data.redeemedItems.length > 0) {
          for (let itemId of profileRes.data.redeemedItems) {
            const res = await axios.get(`/items/${itemId}`);
            redeemed.push(res.data);
          }
        }
        setSwappedItems(swapped);
        setRedeemedItems(redeemed);
        // Gather all pending swap requests for user's items
        const allRequests = [];
        itemsRes.data.forEach(item => {
          if (item.swapRequests && item.swapRequests.length > 0) {
            item.swapRequests.forEach(req => {
              if (req.status === 'pending') {
                allRequests.push({
                  itemId: item._id,
                  itemTitle: item.title,
                  requesterId: req.requester,
                  status: req.status
                });
              }
            });
          }
        });
        setSwapRequests(allRequests);
        // Gather all swap requests made by the user
        const allMyRequests = [];
        // Fetch all items (approved only)
        const allItemsRes = await axios.get('/items');
        allItemsRes.data.forEach(item => {
          if (item.swapRequests && item.swapRequests.length > 0) {
            item.swapRequests.forEach(req => {
              if (req.requester === profileRes.data._id) {
                allMyRequests.push({
                  itemId: item._id,
                  itemTitle: item.title,
                  uploader: item.uploader?.name || '',
                  status: req.status
                });
              }
            });
          }
        });
        setMySwapRequests(allMyRequests);
      } catch (e) {
        setError(e.response?.data?.msg || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Approve/Reject swap request handler
  const handleSwapResponse = async (itemId, requesterId, action) => {
    setSwapMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/items/${itemId}/swap-response`, { requesterId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSwapMessage(`Swap request ${action}ed.`);
      // Refresh dashboard
      window.location.reload();
    } catch (e) {
      setSwapMessage(e.response?.data?.msg || 'Error processing swap request.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Profile Info */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="text-success mb-3">Welcome, {user?.name}!</h3>
              <p className="mb-1">
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Points Balance:</strong> {user?.points || 0}
              </p>
              <div className="mt-3">
                <Button as={Link} to="/add-item" variant="success" className="me-2">
                  Upload New Item
                </Button>
                <Button as={Link} to="/browse" variant="primary">
                  Browse All Items
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Items */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-success mb-3">My Uploaded Items</h4>
          {userItems.length === 0 ? (
            <p>You haven’t uploaded any items yet.</p>
          ) : (
            <Row>
              {userItems.map((item) => (
                <Col md={4} key={item._id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {item.images?.[0] && (
                      <Card.Img
                        variant="top"
                        src={`http://localhost:8080/${item.images[0]}`}
                        height="200"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{item.title}</Card.Title>
                      <Card.Text>
                        Status:{' '}
                        <span
                          className={
                            item.status === 'available'
                              ? 'text-success'
                              : 'text-muted'
                          }
                        >
                          {item.status}
                        </span>
                      </Card.Text>
                      <Button
                        as={Link}
                        to={`/item/${item._id}`}
                        variant="outline-success"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Swapped Items */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-primary mb-3">Swapped Items</h4>
          {swappedItems.length === 0 ? (
            <p>You have not swapped any items yet.</p>
          ) : (
            <Row>
              {swappedItems.map((item) => (
                <Col md={4} key={item._id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {item.images?.[0] && (
                      <Card.Img
                        variant="top"
                        src={`http://localhost:8080/${item.images[0]}`}
                        height="200"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{item.title}</Card.Title>
                      <Card.Text>
                        Status: <span className="text-primary">Swapped</span>
                      </Card.Text>
                      <Button
                        as={Link}
                        to={`/item/${item._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Redeemed Items */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-warning mb-3">Redeemed Items</h4>
          {redeemedItems.length === 0 ? (
            <p>You have not redeemed any items yet.</p>
          ) : (
            <Row>
              {redeemedItems.map((item) => (
                <Col md={4} key={item._id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {item.images?.[0] && (
                      <Card.Img
                        variant="top"
                        src={`http://localhost:8080/${item.images[0]}`}
                        height="200"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{item.title}</Card.Title>
                      <Card.Text>
                        Status: <span className="text-warning">Redeemed</span>
                      </Card.Text>
                      <Button
                        as={Link}
                        to={`/item/${item._id}`}
                        variant="outline-warning"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Pending Swap Requests for Your Items */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-info mb-3">Pending Swap Requests for Your Items</h4>
          {swapMessage && <Alert variant="info">{swapMessage}</Alert>}
          {swapRequests.length === 0 ? (
            <p>No pending swap requests for your items.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Requester ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {swapRequests.map((req, idx) => (
                  <tr key={idx}>
                    <td>{req.itemTitle}</td>
                    <td>{req.requesterId}</td>
                    <td>{req.status}</td>
                    <td>
                      <Button variant="success" size="sm" className="me-2" onClick={() => handleSwapResponse(req.itemId, req.requesterId, 'approve')}>Approve</Button>
                      <Button variant="danger" size="sm" onClick={() => handleSwapResponse(req.itemId, req.requesterId, 'reject')}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* My Swap Requests */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-info mb-3">My Swap Requests</h4>
          {mySwapRequests.length === 0 ? (
            <p>You have not requested any swaps yet.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Uploader</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mySwapRequests.map((req, idx) => (
                  <tr key={idx}>
                    <td>{req.itemTitle}</td>
                    <td>{req.uploader}</td>
                    <td>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
