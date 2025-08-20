import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { queueAPI, podAPI } from "../services/api";
import "../App.css";

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [queueStatus, setQueueStatus] = useState({
    inQueue: false,
    readyForNextGame: false,
    queueCount: 0,
  });
  const [currentPod, setCurrentPod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load queue status and check for current pod
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get queue status
        const queueRes = await queueAPI.getQueueStatus();
        setQueueStatus({
          inQueue: queueRes.data.data.userStatus.inQueue,
          readyForNextGame: queueRes.data.data.userStatus.readyForNextGame,
          queueCount: queueRes.data.data.queueCount,
        });

        // Check if user is in a pod
        try {
          const podRes = await podAPI.getCurrentPod();
          if (podRes.data.success) {
            setCurrentPod(podRes.data.data);
            navigate("/pod-confirmation");
          }
        } catch (podErr) {
          // No active pod, that's okay
          if (podErr.response?.status !== 404) {
            console.error("Error checking current pod:", podErr);
          }
        }
      } catch (err) {
        setError("Failed to load queue status");
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Poll for updates every 10 seconds
    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Join queue
  const handleJoinQueue = async () => {
    try {
      setLoading(true);
      const res = await queueAPI.joinQueue();
      setQueueStatus({
        ...queueStatus,
        inQueue: res.data.data.inQueue,
        readyForNextGame: res.data.data.readyForNextGame,
      });
    } catch (err) {
      setError("Failed to join queue");
      console.error("Join queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Leave queue
  const handleLeaveQueue = async () => {
    try {
      setLoading(true);
      const res = await queueAPI.leaveQueue();
      setQueueStatus({
        ...queueStatus,
        inQueue: res.data.data.inQueue,
        readyForNextGame: res.data.data.readyForNextGame,
      });
    } catch (err) {
      setError("Failed to leave queue");
      console.error("Leave queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ready for next game
  const handleReadyForNextGame = async () => {
    try {
      setLoading(true);
      const res = await queueAPI.readyForNextGame();
      setQueueStatus({
        ...queueStatus,
        inQueue: res.data.data.inQueue,
        readyForNextGame: res.data.data.readyForNextGame,
      });
    } catch (err) {
      setError("Failed to set ready status");
      console.error("Ready for next game error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Finish playing
  const handleFinishPlaying = async () => {
    try {
      setLoading(true);
      const res = await queueAPI.finishPlaying();
      setQueueStatus({
        ...queueStatus,
        inQueue: res.data.data.inQueue,
        readyForNextGame: res.data.data.readyForNextGame,
      });
    } catch (err) {
      setError("Failed to finish playing");
      console.error("Finish playing error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <h1 className="poppins-extrabold">Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="queue-status">
        <div>
          {currentUser && <p>Welcome, {currentUser.firstName}!</p>}
          <p className="queue-status-text">
            Players in queue: <strong>{queueStatus.queueCount}</strong>
          </p>
          <p>
            Your status:{" "}
            <strong>{queueStatus.inQueue ? "In Queue" : "Not in Queue"}</strong>
            {queueStatus.readyForNextGame && " (Ready for next game)"}
          </p>
        </div>

        <div className="queue-actions">
          {!queueStatus.inQueue ? (
            <button
              className="btn btn-primary"
              onClick={handleJoinQueue}
              disabled={loading}
            >
              Join Queue
            </button>
          ) : (
            <>
              <button
                className="btn btn-danger"
                onClick={handleLeaveQueue}
                disabled={loading}
              >
                Leave Queue
              </button>

              {/* {!queueStatus.readyForNextGame ? (
                <button
                  className="btn btn-success"
                  onClick={handleReadyForNextGame}
                  disabled={loading}
                >
                  Ready for Next Game
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={handleFinishPlaying}
                  disabled={loading}
                >
                  Finish Playing
                </button>
              )} */}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>How It Works</h2>
        <div className="card-body">
          <ol>
            <li>Join the queue when you're ready to play</li>
            <li>
              Once enough players are available, you'll be assigned to a pod of
              4 players
            </li>
            <li>You'll have 2 minutes to confirm your spot in the pod</li>
            <li>
              After your game, you can rate the other players and join the queue
              for another game
            </li>
            <li>
              The system will try to pair you with players you haven't played
              with before
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
