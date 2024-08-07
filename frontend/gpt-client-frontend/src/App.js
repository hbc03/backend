import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Button, Input, Dropdown, Menu } from 'antd';
import { SendOutlined, EllipsisOutlined } from '@ant-design/icons';
import './normalize.css';
import './App.css';
import LoginRegister from './Components/LoginRegister/LoginRegister'; // Correct import path

// Utility function to get time category
// Input: timestamp (Date object)
// Process: Calculates the time difference between the current time and the given timestamp
// Output: String indicating the time category ("Last Hour", "Today", "Yesterday", or date string)
const getTimeCategory = (timestamp) => {
  const now = new Date();
  const sessionDate = new Date(timestamp);
  const timeDifference = now - sessionDate;

  if (timeDifference < 3600000) {
    return "Last Hour";
  } else if (timeDifference < 86400000) {
    return "Today";
  } else if (timeDifference < 172800000) {
    return "Yesterday";
  } else {
    return sessionDate.toLocaleDateString();
  }
};

// Utility function to categorize sessions by time
// Input: sessions (Array of session objects)
// Process: Groups sessions into categories based on their timestamps
// Output: Object categorizing sessions by time
const categorizeSessions = (sessions) => {
  const categories = {};

  sessions.forEach((session) => {
    const category = getTimeCategory(session.timestamp);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(session);
  });

  return categories;
};

// Utility function to limit the length of session names
// Input: message (String)
// Process: Trims the message to the first 5 words and shortens it to 20 characters if needed
// Output: Shortened session title (String)
const getTitleFromMessage = (message) => {
  const words = message.split(" ");
  const title = words.slice(0, 5).join(" ");
  return title.length > 20 ? title.substring(0, 20) + "..." : title;
};

// MainScreen component
const MainScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");

  // Function to handle sending a message
  // Input: none
  // Process: Checks and processes the current message, then updates sessions accordingly
  // Output: Updates state with new sessions and clears current message
  const handleSendMessage = () => {
    if (currentMessage.trim() !== "" && !/^[\s\t\n]/.test(currentMessage)) {
      let newSessions = [...sessions];
      if (currentSession === null) {
        // Create a new session
        const newTitle = getTitleFromMessage(currentMessage);
        const timestamp = new Date();
        newSessions.push({ messages: [{ text: currentMessage, isUser: true }], title: newTitle, timestamp });
        setCurrentSession(newSessions.length - 1);
      } else {
        // Add message to existing session
        newSessions[currentSession].messages.push({ text: currentMessage, isUser: true });
      }
      setSessions(newSessions);
      setCurrentMessage("");
    }
  };

  // Function to handle creating a new session
  // Input: none
  // Process: Clears the current message and resets current session
  // Output: Updates state to reset current session and message
  const handleNewSession = () => {
    setCurrentMessage("");
    setCurrentSession(null);
  };

  // Function to switch between sessions
  // Input: index (Number)
  // Process: Sets the current session to the session at the given index
  // Output: Updates state with the new current session index
  const handleSwitchSession = (index) => {
    setCurrentSession(index);
  };

  // Function to delete a session
  // Input: index (Number)
  // Process: Removes the session at the given index and adjusts current session if needed
  // Output: Updates state with new sessions and adjusts current session index
  const handleDeleteSession = (index) => {
    if (sessions.length === 1) {
      return; // Prevent deleting the last remaining session
    }

    const newSessions = sessions.filter((_, i) => i !== index);
    setSessions(newSessions);

    if (currentSession === index) {
      setCurrentSession(null); // Reset current session
    } else if (currentSession > index) {
      setCurrentSession(currentSession - 1);
    }
  };

  // Function to rename a session
  // Input: index (Number), newName (String)
  // Process: Renames the session at the given index if the new name is valid
  // Output: Updates state with the renamed session
  const handleRenameSession = (index, newName) => {
    if (newName.trim() !== "" && !/^[\s\t\n]*$/.test(newName)) {
      const newSessions = [...sessions];
      newSessions[index].title = newName;
      setSessions(newSessions);
    }
  };

  // Function to generate a unique session title
  // Input: sessions (Array of session objects)
  // Process: Finds the highest number in existing session titles and increments it
  // Output: New unique session title (String)
  const generateUniqueSessionTitle = (sessions) => {
    const existingNumbers = sessions
      .map(session => session.title)
      .filter(title => title.startsWith("LiterAI "))
      .map(title => parseInt(title.replace("LiterAI ", ""), 10))
      .filter(number => !isNaN(number));

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `LiterAI ${maxNumber + 1}`;
  };

  // Function to handle key press (Enter) to send message
  // Input: event (KeyboardEvent)
  // Process: Calls handleSendMessage if Enter key is pressed
  // Output: none
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // Function to handle input change for the message
  // Input: e (Event)
  // Process: Updates currentMessage state if input is valid
  // Output: Updates state with the new message input value
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (!/^[\s\t\n]/.test(value)) {
      setCurrentMessage(value);
    }
  };

  // Menu for session options (Rename, Delete)
  // Input: index (Number)
  // Process: Creates a dropdown menu with options to rename or delete a session
  // Output: JSX Element representing the menu
  const menu = (index) => (
    <Menu>
      <Menu.Item onClick={() => handleRenameSession(index, prompt("Enter new name").trim())}>
        Rename
      </Menu.Item>
      <Menu.Item onClick={() => handleDeleteSession(index)} disabled={sessions.length === 1}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="App">
      <aside className="sideMenu">
        <div className="newSessionButton" onClick={handleNewSession}>
          + Yeni LiterAI
        </div>
        {Object.entries(categorizeSessions(sessions)).map(([category, sessionsInCategory]) => (
          <div key={category}>
            <div className="categoryHeader">{category}</div>
            {sessionsInCategory.map((session, index) => (
              <div key={index} className="sideMenuButton">
                <span className="sessionName" onClick={() => handleSwitchSession(sessions.indexOf(session))}>
                  {session.title}
                </span>
                <Dropdown overlay={menu(sessions.indexOf(session))} trigger={['click']}>
                  <Button className="deleteButton" icon={<EllipsisOutlined />} />
                </Dropdown>
              </div>
            ))}
          </div>
        ))}
      </aside>
  
      <section className="chatBox">
        <div className='chatLog'>
          {currentSession !== null && sessions[currentSession].messages.map((msg, index) => (
            <div key={index} className='chatMessage'>
              <div className='chatMessageAligner'>
                <div className='avatar'></div>
                <div className='message'>{msg.text}</div>
              </div>
            </div>
          ))}
          <div className='chatMessageGpt4'>
            <div className='chatMessageAligner'>
              <div className='avatarGpt'></div>
              <div className='message'>Gunaydin</div>
            </div>
          </div>
        </div>
  
        <div className="chatInputBar">
          <Input.TextArea
            className="ChatInputWriteHere"
            rows={1}
            placeholder="Buraya Yazabilirsiniz"
            value={currentMessage}
            onChange={handleInputChange}
            onPressEnter={handleKeyPress}
            autoSize={{ minRows: 1, maxRows: 6 }}
          />
          <Button
            className="sendButton"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
          />
        </div>
        <p className="warningMessage">
          LiterAI bir Finnovator botudur ve hata yapabilir!
        </p>
      </section>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/register" element={<LoginRegister />} />
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
