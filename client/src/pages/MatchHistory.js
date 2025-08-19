import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { podAPI } from '../services/api';

const MatchHistory = () => {
  const { currentUser } = useContext(AuthContext);
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingPod, setRatingPod] = useState(null);
  const [ratingPlayer, setRatingPlayer] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  
  // Load match history
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await podAPI.getPodHistory();
        if (res.data.success) {
          setMatches(res.data.data);
        }
      } catch (err) {
        setError('Failed to load match history');
        console.error('Match history load error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Open rating modal
  const openRatingModal = (podId, player) => {
    setRatingPod(podId);
    setRatingPlayer(player);
    setSelectedRating(0);
  };
  
  // Close rating modal
  const closeRatingModal = () => {
    setRatingPod(null);
    setRatingPlayer(null);
    setSelectedRating(0);
  };
  
  // Submit rating
  const submitRating = async () => {
    if (!ratingPod || !ratingPlayer || selectedRating === 0) return;
    
    try {
      setLoading(true);
      await podAPI.ratePlayer(ratingPod, ratingPlayer._id, selectedRating);
      closeRatingModal();
      
      // Show success message
      setError({ type: 'success', msg: 'Rating submitted successfully' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (err) {
      setError({ 
        type: 'danger', 
        msg: err.response?.data?.message || 'Failed to submit rating' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && matches.length === 0) {
    return <div className="loading">Loading match history...</div>;
  }
  
  return (
    <div className="main-content">
      <h1>Match History</h1>
      
      {error && (
        <div className={`alert alert-${error.type || 'danger'}`}>
          {error.msg || error}
        </div>
      )}
      
      {matches.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>You haven't played any matches yet.</p>
          </div>
        </div>
      ) : (
        <div className="match-list">
          {matches.map(match => (
            <div key={match._id} className="match-item">
              <div className="match-date">
                {formatDate(match.date)}
              </div>
              
              <h3>Pod #{match.pod._id.substring(0, 8)}</h3>
              
              <div className="match-players">
                {match.pod.players.map(player => (
                  <div 
                    key={player.user._id} 
                    className="match-player"
                  >
                    <p>{player.user.firstName} {player.user.lastName}</p>
                    
                    {player.user._id !== currentUser.id && (
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => openRatingModal(match.pod._id, player.user)}
                      >
                        Rate Player
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Rating Modal */}
      {ratingPod && ratingPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Rate Player</h2>
            <p>
              Rating: {ratingPlayer.firstName} {ratingPlayer.lastName}
            </p>
            
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(rating => (
                <span
                  key={rating}
                  className={`star ${rating <= selectedRating ? 'star-filled' : 'star-empty'}`}
                  onClick={() => setSelectedRating(rating)}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={submitRating}
                disabled={selectedRating === 0 || loading}
              >
                Submit Rating
              </button>
              <button 
                className="btn btn-secondary"
                onClick={closeRatingModal}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;