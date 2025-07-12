// Register.js
import { useState } from 'react';
import axios from '../api/axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.includes('@') || !email.includes('.')) return 'Enter a valid email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    setError('');
    try {
      await axios.post('/auth/register', { email, password, name });
      nav('/login');
    } catch (e) {
      setError(e.response?.data?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h2 className="text-center mb-4 text-success">Create an Account</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder=""
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder=""
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button
                    variant="success"
                    disabled={loading}
                    onClick={handleRegister}
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </Form>

              <p className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
