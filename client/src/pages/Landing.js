import { Link } from 'react-router-dom';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';

export default function Landing() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col md={8} className="text-center">
          <h1 className="display-4 fw-bold text-success mb-3">
            Welcome to ReWear
          </h1>
          <p className="lead text-muted">
            ReWear is a sustainable fashion exchange platform dedicated to reducing textile waste.
            Swap your unused clothes or redeem unique finds with points. Together, we can save
            the planet, one outfit at a time.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h3 className="mb-4 text-success">Get Started</h3>
              <p className="text-muted mb-4">
                Join our community and give your clothes a second life.
                Explore items, list your own, and be part of the sustainable fashion revolution.
              </p>
              <div className="d-grid gap-3">
                <Button
                  as={Link}
                  to="/login"
                  variant="success"
                  size="lg"
                >
                  Start Swapping
                </Button>
                <Button
                  as={Link}
                  to="/browse"
                  variant="primary"
                  size="lg"
                >
                  Browse Items
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-success"
                  size="lg"
                >
                  List an Item
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
