// Login.js
import { useState } from 'react';
import axios from '../api/axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    if (!email.includes('@') || !email.includes('.')) return 'Enter a valid email.';
    if (password.length < 1) return 'Password is required.';
    return '';
  };

  const handleLogin = async () => {
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.msg || 'Login failed.');
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
              <h2 className="text-center mb-4 text-success">Login</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form>
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
                    placeholder=""
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button
                    variant="success"
                    disabled={loading}
                    onClick={handleLogin}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </Form>

              <p className="text-center mt-3">
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
