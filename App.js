import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";  

const socket = io("http://localhost:5000", {
  transports: ["websocket"], });

export default function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  
  const joinChat = () => {
    if (username.trim() !== "") {
      socket.emit("join", username);
    }
  };

  
  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", message);
      setMessage("");
    }
  };


  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, { sender: data.sender, text: data.text }]);

    });
    
    socket.on("user_joined", (user) => {
      setChat((prev) => [...prev, { system: true, text: `${user} joined the chat!` }]);


    });

    socket.on("user_typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000); // Clear after 2 sec
    });

    return () => {
      socket.off(); // Clean up listeners
    };
  }, []);

  return (
    <div className="chat-container">
      <h1>WeChat Box</h1>
       {/* Enter Username */}
      <div className="username-input">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={joinChat}>Join</button>
      </div>

      {/* Chat Messages */}
      <div className="message-container">
        {chat.map((msg, i) => {
    if (msg.system) {
      return (
        <p key={i} className="system-message">
          {msg.text}
        </p>
      );
    }

    const isSent = msg.sender === username;

    return (
      <p key={i} className={`message ${isSent ? "sent" : "received"}`}>
        {msg.sender}: {msg.text}
      </p>
    );
  })}
  {typingUser && <p className="typing">{typingUser} is typing...</p>}
</div>

      {/* Send Message */}
      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
          setMessage(e.target.value);
          if (username.trim() !== "") {
            socket.emit("typing");
          }
        }}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div> 
    </div> 
  );
}
     
