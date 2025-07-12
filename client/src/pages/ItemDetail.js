import { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import { Container, Carousel, Button, Alert, Card } from 'react-bootstrap';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchItem = useCallback(async () => {
    try {
      const res = await axios.get(`/items/${id}`);
      setItem(res.data);
    } catch (e) {
      setError('Failed to load item details.');
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleSwapRequest = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.post(`/items/${id}/swap-request`);
      setSuccess('Swap request sent to uploader.');
      fetchItem();
    } catch (e) {
      setError(e.response?.data?.msg || 'Error sending swap request');
    }
  };

  const handleRedeem = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.post(`/items/${id}/redeem`);
      setSuccess('Item redeemed successfully!');
      fetchItem();
    } catch (e) {
      setError(e.response?.data?.msg || 'Error redeeming item');
    }
  };

  const handleSwapResponse = async (action) => {
    setError('');
    setSuccess('');
    try {
      await axios.post(`/items/${id}/swap-response`, { action });
      setSuccess(`Swap request ${action}ed.`);
      fetchItem();
    } catch (e) {
      setError(e.response?.data?.msg || 'Error responding to swap request');
    }
  };

  if (!item) return <Container className="mt-5">Loading...</Container>;

  const isUploader = item.uploader?._id === localStorage.getItem('userId');
  const canRequestSwap =
    item.status === 'available' &&
    !item.swapRequest?.status &&
    !isUploader;
  const canRedeem =
    item.status === 'available' && !isUploader;

  return (
    <Container className="mt-5">
      <h2>{item.title}</h2>

      <Carousel className="mb-4">
        {item.images.map((img, idx) => (
          <Carousel.Item key={idx}>
            <img
              src={`http://localhost:8080/${img}`}
              alt={`${item.title} - view ${idx + 1}`}
              className="d-block w-100"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card.Text>
        <strong>Redeem via Points:</strong> 15 points<br />
        <strong>Uploader earns:</strong> 15 points if redeemed, 5 points if swapped<br />
        <strong>Estimated value:</strong> 10–15 points
      </Card.Text>

      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Type:</strong> {item.type}</p>
      <p><strong>Size:</strong> {item.size}</p>
      <p><strong>Condition:</strong> {item.condition}</p>
      <p><strong>Tags:</strong> {item.tags?.join(', ')}</p>
      <p><strong>Uploader:</strong> {item.uploader?.name}</p>
      <p><strong>Status:</strong> {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>

      {canRequestSwap && (
        <Button
          variant="primary"
          className="me-2"
          onClick={handleSwapRequest}
        >
          Request Swap
        </Button>
      )}

      {canRedeem && (
        <Button
          variant="success"
          onClick={handleRedeem}
        >
          Redeem via Points
        </Button>
      )}

      {isUploader && item.swapRequest?.status === 'pending' && (
        <>
          <h5 className="mt-4">Pending Swap Request</h5>
          <p>User <strong>{item.swapRequest.requester}</strong> wants to swap.</p>
          <Button
            variant="success"
            className="me-2"
            onClick={() => handleSwapResponse('approve')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => handleSwapResponse('reject')}
          >
            Reject
          </Button>
        </>
      )}
    </Container>
  );
}
