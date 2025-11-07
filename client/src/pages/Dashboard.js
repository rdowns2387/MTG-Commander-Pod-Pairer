import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { queueAPI, podAPI } from "../services/api";
import "../App.scss";

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
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval); // Stop the timer when it reaches zero
    }
    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [timeLeft]);

  // Load queue status and check for current pod
  useEffect(() => {
    const loadData = async () => {
      setTimeLeft(10);
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
      <div className="username-container">
        <p>Welcome</p>
        <h1 className="poppins-extrabold">
          {" "}
          {currentUser.email.includes("guest") ? (
            <p>{`${currentUser.firstName} ${currentUser.lastName}`}</p>
          ) : (
            <p>{`${currentUser.firstName}`}</p>
          )}
        </h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="queue-status">
        <div>
          <h1 className="queue-count">
            <strong>{queueStatus.queueCount}</strong>
          </h1>
          <p className="my-1">players currently in queue</p>

          {!queueStatus.inQueue ? (
            <button
              className="btn btn-primary my-1"
              onClick={handleJoinQueue}
              disabled={loading}
            >
              Join Queue
            </button>
          ) : (
            <>
              <button
                className="btn btn-danger my-1"
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
          <p>
            Attempting next match in {timeLeft}
            ...
          </p>
        </div>
      </div>

      <div className="card">
        <h2>How this works</h2>
        <div className="card-body">
          <ol>
            <li>Join the queue when you're ready to play</li>
            <li>
              Once enough players are available, you'll be assigned to a pod of
              4 players
            </li>
            <li>You'll have 2 minutes to confirm your spot in the pod</li>
            {!currentUser.email.includes("guest") && (
              <>
                {" "}
                <li>
                  After your game, you can rate the other players and join the
                  queue for another game
                </li>
                <li>
                  The system will try to pair you with players you haven't
                  played with before
                </li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
