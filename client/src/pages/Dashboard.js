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
  const [ongoingSwaps, setOngoingSwaps] = useState([]);
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        // get swap data
        const swapsRes = await axios.get('/swaps/mine', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setOngoingSwaps(
          swapsRes.data.filter((swap) => swap.status === 'pending')
        );
        setCompletedSwaps(
          swapsRes.data.filter((swap) => swap.status === 'completed')
        );
      } catch (e) {
        setError(e.response?.data?.msg || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
                        src={`http://localhost:5000/${item.images[0]}`}
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

      {/* Ongoing Swaps */}
      <Row className="mb-5">
        <Col md={12}>
          <h4 className="text-primary mb-3">Ongoing Swaps</h4>
          {ongoingSwaps.length === 0 ? (
            <p>You have no ongoing swaps.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>With User</th>
                  <th>Status</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {ongoingSwaps.map((swap) => (
                  <tr key={swap._id}>
                    <td>{swap.itemTitle}</td>
                    <td>{swap.otherUserName}</td>
                    <td className="text-warning">{swap.status}</td>
                    <td>
                      <Button
                        as={Link}
                        to={`/swap/${swap._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Completed Swaps */}
      <Row>
        <Col md={12}>
          <h4 className="text-secondary mb-3">Completed Swaps</h4>
          {completedSwaps.length === 0 ? (
            <p>You have no completed swaps yet.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>With User</th>
                  <th>Status</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {completedSwaps.map((swap) => (
                  <tr key={swap._id}>
                    <td>{swap.itemTitle}</td>
                    <td>{swap.otherUserName}</td>
                    <td className="text-success">{swap.status}</td>
                    <td>
                      <Button
                        as={Link}
                        to={`/swap/${swap._id}`}
                        variant="outline-secondary"
                        size="sm"
                      >
                        Details
                      </Button>
                    </td>
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
