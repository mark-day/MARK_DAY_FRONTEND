const Notification = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        backgroundColor: "#4BB543",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 5,
        zIndex: 1000,
        cursor: "pointer"
      }}
    >
      {message}
      <div style={{ fontSize: 12, opacity: 0.7 }}>(Click to dismiss)</div>
    </div>
  );
};

export default Notification;
