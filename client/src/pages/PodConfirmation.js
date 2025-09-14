import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { podAPI } from "../services/api";

const PodConfirmation = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pod, setPod] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userConfirmed, setUserConfirmed] = useState(false);

  // Load current pod data
  useEffect(() => {
    const loadPod = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await podAPI.getCurrentPod();
        if (res.data.success) {
          setPod(res.data.data);

          // Check if user has already confirmed
          const userPlayer = res.data.data.players.find(
            (player) => player.user._id === currentUser.id
          );

          if (userPlayer) {
            setUserConfirmed(userPlayer.confirmed);
          }

          // Calculate time left for confirmation
          const deadline = new Date(res.data.data.confirmationDeadline);
          const now = new Date();
          const secondsLeft = Math.max(0, Math.floor((deadline - now) / 1000));
          setTimeLeft(secondsLeft);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No active pod, redirect to dashboard
          navigate("/dashboard");
        } else {
          setError("Failed to load pod information");
          console.error("Pod load error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPod();

    // Poll for updates every 5 seconds
    const interval = setInterval(loadPod, 5000);

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Confirm pod
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await podAPI.confirmPod(pod._id);
      setUserConfirmed(true);

      // Refresh pod data
      // const res = await podAPI.getCurrentPod();
      // setPod(res.data.data);
    } catch (err) {
      setError("Failed to confirm pod");
      console.error("Pod confirmation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reject pod
  const handleReject = async () => {
    try {
      setLoading(true);
      await podAPI.rejectPod(pod._id);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to reject pod");
      console.error("Pod rejection error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft === null) return "";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading && !pod) {
    return <div className="loading">Loading pod information...</div>;
  }

  if (!pod) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          No active pod found. Redirecting to dashboard...
        </div>
      </div>
    );
  }

  // Check if pod is confirmed by all players
  const allConfirmed = pod.players.every((player) => player.confirmed);

  return (
    <div className="main-content">
      <h1>Pod Assignment</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="pod-card">
        <div className="pod-header">
          <h2>Pod #{pod._id.substring(0, 8)}</h2>
          <span>
            Status: {pod.status.charAt(0).toUpperCase() + pod.status.slice(1)}
          </span>
        </div>

        <div className="pod-body">
          {!allConfirmed && timeLeft > 0 && (
            <div className="pod-timer">Time to confirm: {formatTimeLeft()}</div>
          )}

          <h3>Players</h3>
          <p>
            You are: {currentUser.firstName} {currentUser.lastName}
          </p>
          <div className="pod-players">
            {pod.players.map((player) => (
              <div
                key={player.user._id}
                className="pod-player"
                style={{
                  color: player.confirmed && "green",
                  backgroundColor: player.confirmed
                    ? "#d4edda"
                    : player.rejected
                    ? "#f8d7da"
                    : "black",
                }}
              >
                <p>
                  {player.user.firstName} {player.user.lastName}
                </p>
                <p>
                  {player.confirmed
                    ? "✅ Confirmed"
                    : player.rejected
                    ? "❌ Rejected"
                    : "⏳ Pending"}
                </p>
              </div>
            ))}
          </div>

          {allConfirmed ? (
            <div className="alert alert-success">
              All players have confirmed! Your pod is ready to play.
            </div>
          ) : pod.status === "pending" && !userConfirmed && timeLeft > 0 ? (
            <div className="pod-actions">
              <button
                className="btn btn-success"
                onClick={handleConfirm}
                disabled={loading}
              >
                Confirm Pod
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={loading}
              >
                Reject Pod
              </button>
            </div>
          ) : userConfirmed ? (
            <div className="alert alert-info">
              You have confirmed this pod. Waiting for other players...
            </div>
          ) : timeLeft === 0 ? (
            <div className="alert alert-warning">
              Time expired! You will be placed back in the queue.
              {/* {resetParticipants()} */}
            </div>
          ) : (
            <div className="alert alert-info">
              This pod has been {pod.status}. You will be redirected to the
              dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodConfirmation;
