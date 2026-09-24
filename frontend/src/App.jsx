import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS, LEGACY_API_BASE } from './config/api';

const animationStyle = document.createElement('style');
animationStyle.innerHTML = `
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(animationStyle);

const getUserKey = (userId, suffix) => `sc_${userId}_${suffix}`;

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sc_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sc_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sc_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.removeItem('sc_users');
    localStorage.removeItem('LS_USERS');
    localStorage.removeItem('LS_CURRENT_USER');
  }, []);

  const userId = currentUser?._id || currentUser?.studentId;

  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);

  useEffect(() => {
    if (userId) {
      try {
        setExpenses(JSON.parse(localStorage.getItem(getUserKey(userId, 'expenses')) || "[]"));
        setTasks(JSON.parse(localStorage.getItem(getUserKey(userId, 'tasks')) || "[]"));
        setEvents(JSON.parse(localStorage.getItem(getUserKey(userId, 'events')) || "[]"));
        setFeedPosts(JSON.parse(localStorage.getItem(getUserKey(userId, 'feed')) || "[]"));
        setMoodLogs(JSON.parse(localStorage.getItem(getUserKey(userId, 'moods')) || "[]"));
        setAvatar(localStorage.getItem(getUserKey(userId, 'avatar')) || null);
        setDiaryEntries(JSON.parse(localStorage.getItem(getUserKey(userId, 'diary')) || "[]"));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    } else {
      setExpenses([]);
      setTasks([]);
      setEvents([]);
      setFeedPosts([]);
      setMoodLogs([]);
      setAvatar(null);
      setDiaryEntries([]);
    }
  }, [userId]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingReset, setPendingReset] = useState(null);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'expenses'), JSON.stringify(expenses));
    }
  }, [expenses, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'tasks'), JSON.stringify(tasks));
    }
  }, [tasks, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'events'), JSON.stringify(events));
    }
  }, [events, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'feed'), JSON.stringify(feedPosts));
    }
  }, [feedPosts, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'moods'), JSON.stringify(moodLogs));
    }
  }, [moodLogs, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(getUserKey(userId, 'diary'), JSON.stringify(diaryEntries));
    }
  }, [diaryEntries, userId]);

  useEffect(() => {
    if (userId && avatar) {
      localStorage.setItem(getUserKey(userId, 'avatar'), avatar);
    }
  }, [avatar, userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    if (token && email) {
      setPendingReset({ token, email });
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      console.log('App: Fetching feed posts from backend...');
      fetch(API_ENDPOINTS.feed)
        .then(r => r.json())
        .then(data => {
          console.log('App: Feed posts loaded:', data.length, 'posts');
          setFeedPosts(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('App: Failed to load feed:', err);
        });
    }
  }, [currentUser]);


  if (!currentUser) {
    return (
      <AuthScreen
        setCurrentUser={setCurrentUser}
        pendingReset={pendingReset}
        clearPendingReset={() => setPendingReset(null)}
      />
    );
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>Student Companion</div>

        {[
          "dashboard",
          "expenses",
          "planner",
          "events",
          "wellbeing",
          "diary",
          "myboard",
          "profile"
        ].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.menuItem,
              ...(activeTab === tab ? styles.menuActive : {})
            }}
          >
            {tab.toUpperCase()}
          </div>
        ))}
      </aside>

      <div style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>{activeTab.toUpperCase()}</h1>
          <p style={styles.headerUser}>Logged in as {currentUser.name}</p>
        </header>

        <div style={styles.body}>
          {activeTab === "dashboard" && (
            <Dashboard
              expenses={expenses}
              tasks={tasks}
              events={events}
              moodLogs={moodLogs}
              feedPosts={feedPosts}
              diaryEntries={diaryEntries}
              openTab={setActiveTab}
              userId={currentUser?._id || currentUser?.studentId}
            />
          )}

          {activeTab === "expenses" && (
            <Expenses expenses={expenses} setExpenses={setExpenses} userId={currentUser?._id || currentUser?.studentId} />
          )}

          {activeTab === "planner" && (
            <Planner tasks={tasks} setTasks={setTasks} userId={currentUser?._id || currentUser?.studentId} />
          )}

          {activeTab === "events" && (
            <Events events={events} setEvents={setEvents} userId={currentUser?._id || currentUser?.studentId} />
          )}

          {activeTab === "wellbeing" && (
            <Wellbeing moodLogs={moodLogs} setMoodLogs={setMoodLogs} userId={currentUser?._id || currentUser?.studentId} />
          )}

          {activeTab === "diary" && (
            <Diary diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} userId={currentUser?._id || currentUser?.studentId} />
          )}

          {activeTab === "myboard" && (
            <MyBoard feedPosts={feedPosts} setFeedPosts={setFeedPosts} userId={currentUser?._id || currentUser?.studentId} currentUser={currentUser} events={events} setEvents={setEvents} />
          )}

          {activeTab === "profile" && (
            <Profile
              user={currentUser}
              avatar={avatar}
              setAvatar={setAvatar}
              setCurrentUser={setCurrentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ setCurrentUser, pendingReset, clearPendingReset }) {
  const [view, setView] = useState("home");

  useEffect(() => {
    if (pendingReset) {
      setView("reset");
    }
  }, [pendingReset]);

  function AuthHome() {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authBox}>
          <h2 style={{ marginBottom: 16 }}>Welcome</h2>
          <p style={{ marginBottom: 12 }}>Please register or login to continue.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.primary} onClick={() => setView("register")}>
              Register
            </button>
            <button style={styles.secondary} onClick={() => setView("login")}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  function RegistrationForm() {
    const departments = [
      "MSc Data Science",
      "MSc AI",
      "MSc Computer Science",
      "MSc Pharma",
      "MSc Mechanical Engineering",
      "MSc Aeronautical",
    ];

    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [department, setDepartment] = useState(departments[0]);
    const [batch, setBatch] = useState("");
    const [message, setMessage] = useState("");

    const years = [];
    const thisYear = new Date().getFullYear();
    for (let y = 2000; y <= thisYear + 1; y++) years.push(y);
    const batchOptions = [];
    years.forEach((y) => {
      batchOptions.push(`Spring ${y}`);
      batchOptions.push(`Fall ${y}`);
    });

    const validateEmail = (em) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    };

    const validatePassword = (pw) => {
      if (!pw || pw.length < 8) return false;
      if (!/[A-Za-z]/.test(pw)) return false;
      if (!/\d/.test(pw)) return false;
      const symbolRegex = /[!@#$%^&*()_+\-={}\[\]|\\:\"<>\?;',\.\/~`]/;
      if (!symbolRegex.test(pw)) return false;
      return true;
    };

    const handleRegister = async () => {
      if (!studentId || !password || !name || !email || !phone || !department || !batch) {
        setMessage("All fields are required.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage("Please provide a valid email address.");
        return;
      }

      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push("at least 8 characters");
      if (!/[A-Z]/.test(password)) passwordErrors.push("uppercase letter");
      if (!/[0-9]/.test(password)) passwordErrors.push("number");
      
      if (passwordErrors.length > 0) {
        setMessage(`Password must contain: ${passwordErrors.join(", ")}`);
        return;
      }

      const newUser = { studentId, password, name, email, phone, department, batch };

      try {
        const res = await fetch(API_ENDPOINTS.register, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessage(err.error || "Registration failed on server");
        } else {
          const data = await res.json();
          setMessage("Registered successfully. You can now login.");
          setView("login");
        }
      } catch (e) {
        setMessage("Cannot connect to server. Please check your connection and try again.");
      }
    };

    return (
      <div style={styles.authWrapper}>
        <div style={{ ...styles.authBox, maxHeight: "90vh", overflowY: "auto" }}>
          <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 600 }}>Create Your Account</h2>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Registration Number</label>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              placeholder="Enter registration number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Password</label>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              Min 8 chars with uppercase, number, and special character
            </p>
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Full Name</label>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Email</label>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Phone</label>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Department</label>
            <select
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: "left", width: "100%", marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Batch / Semester</label>
            <select
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            >
              <option value="">Select batch</option>
              {batchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ ...styles.primary, flex: 1 }} onClick={handleRegister}>Create Account</button>
            <button style={{ ...styles.secondary, flex: 1 }} onClick={()=>setView("home")}>Back</button>
          </div>

          {message && <p style={{ marginTop: 12, color: message.includes("success") ? "green" : "red", fontSize: 14 }}>{message}</p>}
        </div>
      </div>
    );
  }

  function LoginForm() {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
      if (!studentId || !password) {
        setMessage("Enter registration number and password.");
        return;
      }

      try {
        const res = await fetch(API_ENDPOINTS.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({}));
          setMessage(err.error || "Login failed");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (e) {
        setMessage("Cannot connect to server. Please check your connection and try again.");
      }
    };

    return (
      <div style={styles.authWrapper}>
        <div style={styles.authBox}>
          <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 600 }}>Login to Your Account</h2>
          
          <div style={{ textAlign: "left", width: "100%", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Registration Number</label>
            <input 
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }} 
              placeholder="Enter registration number" 
              value={studentId} 
              onChange={(e)=>setStudentId(e.target.value)} 
            />
          </div>
          
          <div style={{ textAlign: "left", width: "100%", marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Password</label>
            <input 
              style={{ ...styles.input, width: "100%", boxSizing: "border-box" }} 
              placeholder="Enter password" 
              type="password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ ...styles.primary, flex: 1 }} onClick={handleLogin}>Login</button>
            <button style={{ ...styles.secondary, flex: 1 }} onClick={()=>setView("home")}>Back</button>
          </div>

          {message && <p style={{ marginTop: 12, color: "red", fontSize: 14 }}>{message}</p>}
        </div>
      </div>
    );
  }

  function ResetPasswordForm() {
    const [email, setEmail] = useState(pendingReset?.email || "");
    const [token, setToken] = useState(pendingReset?.token || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
      if (pendingReset?.email) setEmail(pendingReset.email);
      if (pendingReset?.token) setToken(pendingReset.token);
    }, [pendingReset]);

    const handleReset = async () => {
      if (!email || !token || !newPassword || !confirmPassword) {
        setMessage("All fields are required.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      const passwordErrors = [];
      if (newPassword.length < 8) passwordErrors.push("at least 8 characters");
      if (!/[A-Z]/.test(newPassword)) passwordErrors.push("uppercase letter");
      if (!/[0-9]/.test(newPassword)) passwordErrors.push("number");
      if (passwordErrors.length > 0) {
        setMessage(`Password must contain: ${passwordErrors.join(", ")}`);
        return;
      }

      try {
        const res = await fetch(API_ENDPOINTS.resetPassword, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token, newPassword }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessage(err.error || "Reset failed");
          return;
        }
        setMessage("Password reset successful. You can now login.");
        clearPendingReset();
        setTimeout(() => setView("login"), 1200);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        setMessage("Error: " + err.message);
      }
    };

    return (
      <div style={styles.authWrapper}>
        <div style={styles.authBox}>
          <h2 style={{ marginBottom: 16 }}>Reset Password</h2>
          <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input style={styles.input} placeholder="Reset Token" value={token} onChange={(e)=>setToken(e.target.value)} />
          <input style={styles.input} placeholder="New Password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
          <input style={styles.input} placeholder="Confirm New Password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={styles.primary} onClick={handleReset}>Update Password</button>
            <button style={styles.secondary} onClick={()=>setView("home")}>Back</button>
          </div>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </div>
    );
  }

  if (view === "home") return <AuthHome />;
  if (view === "register") return <RegistrationForm />;
  if (view === "reset") return <ResetPasswordForm />;
  return <LoginForm />;
}

function Dashboard({
  expenses,
  tasks,
  events,
  moodLogs,
  feedPosts,
  diaryEntries,
  openTab,
  userId
}) {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`sc_personalNotes_${userId}`) || "[]");
    } catch {
      return [];
    }
  });

  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      
      const todayExpenses = expenses.filter(e => {
        if (!e.date) return false;
        return e.date.startsWith(today);
      });
      
      const todayTasks = tasks;
      
      const todayEvents = events;
      
      const todayFeedPosts = feedPosts.filter(f => {
        if (!f.timestamp || f.userId !== userId) return false;
        const postDate = new Date(f.timestamp).toISOString().split('T')[0];
        return postDate === today;
      });
      
      const todayDiary = diaryEntries.filter(d => {
        if (!d.date) return false;
        return d.date.startsWith(today);
      });
      
      setStats({
        totalExpenses: todayExpenses.length,
        totalExpenseAmount: todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalFeedPosts: todayFeedPosts.length,
        totalEvents: todayEvents.length,
        totalTasks: todayTasks.length,
        totalDiaryEntries: todayDiary.length,
      });
    }
  }, [userId, expenses, tasks, events, feedPosts, diaryEntries]);

  useEffect(() => {
    if (userId) {
      try {
        const saved = JSON.parse(localStorage.getItem(`sc_personalNotes_${userId}`) || "[]");
        setNotes(saved);
      } catch {
        setNotes([]);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId && notes.length >= 0) {
      localStorage.setItem(`sc_personalNotes_${userId}`, JSON.stringify(notes));
    }
  }, [notes, userId]);

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      alert("Please enter some text for your note.");
      return;
    }

    let fileData = null;
    let fileName = null;

    if (noteFile) {
      const reader = new FileReader();
      fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(noteFile);
      });
      fileName = noteFile.name;
    }

    const newNote = {
      id: Date.now(),
      text: noteText.trim(),
      date: noteDate || new Date().toISOString().split('T')[0],
      fileData,
      fileName,
      timestamp: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setNoteText("");
    setNoteDate("");
    setNoteFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setNoteFile(file);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const cards = [
    {
      id: "expenses",
      title: "Expenses",
      description: `${expenses.length} expense(s) recorded`
    },
    {
      id: "planner",
      title: "Planner",
      description: `${tasks.length} task(s) in your to-do list`
    },
    {
      id: "events",
      title: "Events",
      description: `${events.length} event(s) on your calendar`
    },
    {
      id: "wellbeing",
      title: "Wellbeing",
      description: `${moodLogs.length} mood log(s)`
    },
    {
      id: "diary",
      title: "Diary / Journal",
      description: `${diaryEntries.length} entry(ies)`
    },
    {
      id: "myboard",
      title: "MyBoard / Feed",
      description: "View feed"
    }
  ];

  return (
    <div>
      {stats && (
        <div style={{ ...styles.card, marginBottom: 20, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <h3 style={{ ...styles.cardTitle, color: "white" }}>Today's Activity</h3>
          <div style={styles.grid3}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>₹{stats.totalExpenseAmount || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Total Spent</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalFeedPosts || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Feed Posts</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalEvents || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Events</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalTasks || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Tasks</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalDiaryEntries || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Diary Entries</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{stats.totalExpenses || 0}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Expenses</div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.grid3}>
        {cards.map((c) => (
          <div
            key={c.id}
            style={styles.cardClickable}
            onClick={() => openTab(c.id)}
          >
            <h3 style={styles.cardTitle}>{c.title}</h3>
            <p style={styles.text}>{c.description}</p>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3 style={styles.cardTitle}>Personal Notes</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Private notes only you can see</p>

        <div style={{ marginBottom: 16 }}>
          <textarea
            style={{ ...styles.input, height: 80, resize: "vertical", width: "100%", boxSizing: "border-box", marginBottom: 12 }}
            placeholder="Write your thoughts, reminders, or notes..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          
          <div style={{ ...styles.row, marginBottom: 12 }}>
            <input
              type="date"
              style={styles.input}
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              placeholder="Date (optional)"
            />
            
            <label style={{ ...styles.secondary, cursor: "pointer", marginBottom: 0, padding: "10px 14px" }}>
              📎 Attach File
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            <button style={styles.primary} onClick={handleAddNote}>
              Add Note
            </button>
          </div>

          {noteFile && (
            <div style={{ padding: 10, background: "#f0f0f0", borderRadius: 6, fontSize: 13 }}>
              📎 {noteFile.name}
              <button
                onClick={() => setNoteFile(null)}
                style={{ marginLeft: 10, background: "none", border: "none", color: "red", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div>
          {notes.length === 0 ? (
            <p style={{ ...styles.text, textAlign: "center", color: "#999" }}>No notes yet. Add one above!</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                style={{
                  marginBottom: 12,
                  padding: 14,
                  background: "#fffef7",
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                  position: "relative"
                }}
              >
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "none",
                    border: "none",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                  title="Delete note"
                >
                  ✕
                </button>
                
                <p style={{ margin: "0 0 8px 0", fontSize: 14, lineHeight: 1.5, paddingRight: 30 }}>
                  {note.text}
                </p>
                
                <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
                  📅 {note.date}
                  {note.fileName && (
                    <>
                      {" • "}
                      <a
                        href={note.fileData}
                        download={note.fileName}
                        style={{ color: "#4b7bec", textDecoration: "none" }}
                      >
                        📎 {note.fileName}
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function filterByDate(items, getDateStr, filterType, fromDate, toDate) {
  if (!items || items.length === 0) return [];

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const parseDate = (ds) => {
    const d = new Date(ds);
    return isNaN(d.getTime()) ? null : d;
  };

  if (filterType === "all") return items;

  if (filterType === "week") {
    return items.filter((it) => {
      const d = parseDate(getDateStr(it));
      if (!d) return false;
      const diffMs = startOfToday - d;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });
  }

  if (filterType === "month") {
    return items.filter((it) => {
      const d = parseDate(getDateStr(it));
      if (!d) return false;
      return (
        d.getFullYear() === startOfToday.getFullYear() &&
        d.getMonth() === startOfToday.getMonth()
      );
    });
  }

  if (filterType === "year") {
    return items.filter((it) => {
      const d = parseDate(getDateStr(it));
      if (!d) return false;
      return d.getFullYear() === startOfToday.getFullYear();
    });
  }

  if (filterType === "range" && fromDate && toDate) {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) return items;
    return items.filter((it) => {
      const d = parseDate(getDateStr(it));
      if (!d) return false;
      return d >= from && d <= to;
    });
  }

  return items;
}

function Expenses({ expenses, setExpenses, userId }) {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [graphRange, setGraphRange] = useState("all");

  useEffect(() => {
    if (userId) {
      fetch(`${API_ENDPOINTS.expenses}?userId=${userId}`)
        .then(r => r.json())
        .then(data => setExpenses(data))
        .catch(() => {}); // fallback to localStorage
    }
  }, [userId, setExpenses]);

  const addExpense = async () => {
    if (!item || !amount || !date) {
      alert("Please fill item, amount and date.");
      return;
    }
    const newExp = {
      userId,
      title: item,
      amount: Number(amount),
      date
    };
    
    try {
      const res = await fetch(API_ENDPOINTS.expenses, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExp)
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses((prev) => [data.expense, ...prev]);
      }
    } catch (e) {
      // fallback to localStorage
      setExpenses((prev) => [{ ...newExp, id: Date.now() }, ...prev]);
    }
    
    setItem("");
    setAmount("");
    setDate("");
  };

  const deleteExpense = async (expenseId) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const res = await fetch(`${API_ENDPOINTS.expenses}/${expenseId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setExpenses(prev => prev.filter(e => (e._id || e.id) !== expenseId));
      }
    } catch (e) {
      setExpenses(prev => prev.filter(e => (e._id || e.id) !== expenseId));
    }
  };

  const filteredExpenses = filterByDate(
    expenses,
    (e) => e.date,
    filterType,
    fromDate,
    toDate
  );

  // Prepare graph data - aggregate by date
  const graphExpenses = filterByDate(expenses, (e) => e.date, graphRange, null, null);
  
  // Group expenses by date and sum amounts
  const dateMap = {};
  graphExpenses.forEach(e => {
    if (!dateMap[e.date]) {
      dateMap[e.date] = 0;
    }
    dateMap[e.date] += Number(e.amount);
  });
  
  // Convert to array and sort by date
  const graphData = Object.entries(dateMap)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, amount]) => ({
      date,
      amount
    }));
  
  const maxAmount = Math.max(...graphData.map(d => d.amount), 0);
  const yAxisMax = maxAmount + 10;

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Expenses</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Amount (£)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button style={styles.primary} onClick={addExpense}>
          Add
        </button>
      </div>

      {graphData.length > 0 && (
        <div style={{ marginTop: 20, marginBottom: 20, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
          <div style={{ ...styles.row, marginBottom: 12 }}>
            <h4 style={{ margin: 0 }}>Expense Timeline</h4>
            <select
              style={styles.input}
              value={graphRange}
              onChange={(e) => setGraphRange(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, yAxisMax]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#ff6b6b" strokeWidth={2} name="Amount (£)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ ...styles.row, marginBottom: 10 }}>
        <select
          style={styles.input}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="week">This week (last 7 days)</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="range">Custom date range</option>
        </select>
        {filterType === "range" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <p style={styles.text}>No expenses for this selection.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Amount (£)</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e._id || e.id}>
                <td style={styles.td}>{e.date}</td>
                <td style={styles.td}>{e.title || e.item}</td>
                <td style={styles.td}>£{Number(e.amount).toFixed(2)}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => deleteExpense(e._id || e.id)}
                    style={{
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Planner({ tasks, setTasks, userId }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/tasks?userId=${userId}`)
        .then(r => r.json())
        .then(data => setTasks(data))
        .catch(() => {}); // fallback to localStorage
    }
  }, [userId, setTasks]);

  const addTask = async () => {
    if (!text || !date) {
      alert("Please fill task and date.");
      return;
    }

    const newTask = {
      userId,
      title: text,
      dueDate: date,
      completed: false
    };

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch (e) {
      setTasks((prev) => [...prev, { ...newTask, id: Date.now(), text, date, time: time || "", done: false }]);
    }

    setText("");
    setDate("");
    setTime("");
  };
  // -------------------------------------------------------------

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id || t._id === id ? { ...t, done: !t.done, completed: !t.completed } : t))
    );
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      }
    } catch (e) {
      setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
    }
  };

  const filteredTasks = filterByDate(
    tasks,
    (t) => t.date || t.dueDate,
    filterType,
    fromDate,
    toDate
  );

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>To-do Planner</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Task description"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          style={styles.input}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button style={styles.primary} onClick={addTask}>
          Add
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...styles.row, marginBottom: 10 }}>
        <select
          style={styles.input}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="week">This week (last 7 days)</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="range">Custom date range</option>
        </select>

        {filterType === "range" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <p style={styles.text}>No tasks for this selection.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {filteredTasks.map((t) => (
            <li key={t._id || t.id} style={{ ...styles.todoItem, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={t.done || t.completed}
                  onChange={() => toggleTask(t._id || t.id)}
                />
                <span
                  style={{
                    marginLeft: 8,
                    textDecoration: t.done || t.completed ? "line-through" : "none"
                  }}
                >
                  {t.text || t.title} — {t.date || t.dueDate} {t.time && `— ${t.time}`}
                </span>
              </div>
              <button
                onClick={() => deleteTask(t._id || t.id)}
                style={{
                  background: "#ff6b6b",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                  marginLeft: 10
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EVENT_COLORS = [
  { label: "Blue", value: "#4b7bec" },
  { label: "Green", value: "#2ecc71" },
  { label: "Purple", value: "#9b59b6" },
  { label: "Orange", value: "#e67e22" },
  { label: "Teal", value: "#1abc9c" }
];

function Events({ events, setEvents, userId }) {
  const calendarRef = useRef(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0].value);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/events?userId=${userId}`)
        .then(r => r.json())
        .then(data => setEvents(data))
        .catch(() => {}); // fallback to localStorage
    }
  }, [userId, setEvents]);

  const addEvent = async () => {
    if (!title || !date) {
      alert("Please fill event name and date.");
      return;
    }
    const newEvent = {
      userId,
      title,
      name: title, // backend uses 'name' field
      date,
      time,
      description,
      color
    };
    
    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        const data = await res.json();
        // Make sure the returned event has a 'title' field for display
        const eventToAdd = {
          ...data.event,
          title: data.event.name || data.event.title
        };
        setEvents((prev) => [...prev, eventToAdd]);
      }
    } catch (e) {
      setEvents((prev) => [...prev, { ...newEvent, id: Date.now() }]);
    }
    
    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setColor(EVENT_COLORS[0].value);
  };

  const deleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
      }
    } catch (e) {
      setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
    }
  };

  const calendarEvents = events.map((e) => {
    const hasTime = !!e.time;
    const eventTitle = e.title || e.name || "Untitled Event";
    return {
      id: String(e.id || e._id),
      title: eventTitle,
      start: hasTime ? `${e.date}T${e.time}` : e.date,
      allDay: !hasTime,
      backgroundColor: e.color || EVENT_COLORS[0].value,
      borderColor: e.color || EVENT_COLORS[0].value,
      extendedProps: {
        description: e.description,
        time: e.time
      }
    };
  });

  const handleDateClick = (info) => {
    setDate(info.dateStr);
  };

  const handleEventClick = (clickInfo) => {
    const { title } = clickInfo.event;
    const { description, time } = clickInfo.event.extendedProps;
    const start = clickInfo.event.start;
    let dateStr = "";
    let timeStr = "";

    if (start) {
      const d = new Date(start);
      dateStr = d.toISOString().slice(0, 10);
      timeStr = d.toTimeString().slice(0, 5);
    }

    const msg =
      `${dateStr}${timeStr ? " " + timeStr : ""}\n` +
      `${title}` +
      (description ? `\n\n${description}` : "");

    alert(msg);
  };

  const gotoDate = (d) => {
    setViewDate(d);
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(d);
  };

  const handleMonthNav = (direction) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + direction);
    gotoDate(d);
  };

  const handleMonthSelect = (monthIndex) => {
    const d = new Date(viewDate);
    d.setMonth(monthIndex);
    gotoDate(d);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    const d = new Date(viewDate);
    d.setFullYear(year);
    gotoDate(d);
    setShowYearPicker(false);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const monthName = monthNames[viewDate.getMonth()];
  const year = viewDate.getFullYear();

  const yearStart = year - 5;
  const yearEnd = year + 5;
  const yearList = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    yearList.push(y);
  }

  return (
    <div style={{ ...styles.card, position: "relative" }}>
      <h3 style={styles.cardTitle}>Calendar & Events</h3>

      <div style={styles.calHeaderRow}>
        <div style={styles.calHeaderControls}>
          <button
            style={styles.calNavButton}
            onClick={() => gotoDate(new Date())}
          >
            today
          </button>
        </div>

        <div style={styles.calHeaderCenter}>
          <span
            style={styles.calHeaderLabel}
            onClick={() => {
              setShowMonthPicker((v) => !v);
              setShowYearPicker(false);
            }}
          >
            {monthName}
          </span>
          <span
            style={styles.calHeaderLabel}
            onClick={() => {
              setShowYearPicker((v) => !v);
              setShowMonthPicker(false);
            }}
          >
            {year}
          </span>
        </div>

        <div style={styles.calHeaderControls}>
          <button
            style={styles.calIconButton}
            onClick={() => handleMonthNav(-1)}
          >
            ‹
          </button>
          <button
            style={styles.calIconButton}
            onClick={() => handleMonthNav(1)}
          >
            ›
          </button>
        </div>
      </div>

      {showMonthPicker && (
        <div style={styles.pickerOverlay}>
          <div style={styles.pickerGrid}>
            {monthNames.map((m, idx) => (
              <button
                key={m}
                style={{
                  ...styles.pickerCell,
                  ...(idx === viewDate.getMonth() ? styles.pickerCellActive : {})
                }}
                onClick={() => handleMonthSelect(idx)}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showYearPicker && (
        <div style={styles.pickerOverlay}>
          <div style={styles.pickerGrid}>
            {yearList.map((y) => (
              <button
                key={y}
                style={{
                  ...styles.pickerCell,
                  ...(y === year ? styles.pickerCellActive : {})
                }}
                onClick={() => handleYearSelect(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={viewDate}
          height={600}
          selectable={true}
          dateClick={handleDateClick}
          events={calendarEvents}
          eventClick={handleEventClick}
          headerToolbar={false}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }}
        />
      </div>

      <h4 style={{ marginTop: 0, marginBottom: 8 }}>Add Event</h4>
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Event name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          style={styles.input}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          style={styles.input}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          {EVENT_COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button style={styles.primary} onClick={addEvent}>
          Add
        </button>
      </div>

      {events.length === 0 ? (
        <p style={styles.text}>No events added yet.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {events
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((e) => {
              const eventTitle = e.title || e.name || "Untitled Event";
              return (
                <li key={e.id} style={{ ...styles.text, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <span>
                    {e.date} {e.time && `(${e.time})`}: {eventTitle}
                    {e.description && ` — ${e.description}`}
                  </span>
                  <button
                    onClick={() => deleteEvent(e._id || e.id)}
                    style={{
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

const moodSuggestions = {
  Happy: "Keep going! Celebrate your progress today.",
  Neutral: "Take a small break and do something you enjoy.",
  Sad: "Reach out to a friend or write down your feelings.",
  Stressed: "Pause for a few deep breaths and stretch your body."
};

const affirmationsByMood = {
  Happy: [
    "I am grateful for this moment.",
    "My joy is valid and deserved.",
    "I share my happiness with others.",
    "Good things are happening for me.",
    "I am surrounded by positive energy.",
    "My smile is my superpower.",
    "I am proud of how far I’ve come.",
    "I attract more reasons to be happy.",
    "I allow myself to enjoy today.",
    "I am a source of light to others.",
    "I choose to notice the good.",
    "I am exactly where I need to be.",
    "My small wins matter.",
    "I carry happiness within me.",
    "Today, I celebrate myself."
  ],
  Neutral: [
    "It’s okay to feel neutral today.",
    "I give myself permission to move slowly.",
    "I am doing my best with what I have.",
    "I am allowed to rest.",
    "Even small steps move me forward.",
    "I welcome calm and balance.",
    "I am present in this moment.",
    "My worth is not measured by productivity.",
    "I am learning and growing every day.",
    "I accept myself as I am.",
    "I choose gentle progress over pressure.",
    "I honour my own pace.",
    "I can handle today one step at a time.",
    "I am steady and grounded.",
    "I am enough, exactly as I am."
  ],
  Sad: [
    "My feelings are valid and important.",
    "It’s okay to ask for help.",
    "This moment will not last forever.",
    "I am stronger than I feel right now.",
    "I deserve kindness, especially from myself.",
    "I am not alone in how I feel.",
    "I allow myself to heal.",
    "I am worthy of love and care.",
    "It’s okay to take time to recover.",
    "I am doing my best in a hard moment.",
    "I can get through difficult days.",
    "I trust that better days are coming.",
    "I am gentle with my heart.",
    "Every breath is a fresh start.",
    "I am more than my sadness."
  ],
  Stressed: [
    "I can handle one thing at a time.",
    "I release what I cannot control.",
    "I am capable of finding solutions.",
    "My worth is not defined by my stress.",
    "I choose to pause and breathe.",
    "I am allowed to slow down.",
    "I trust myself to manage challenges.",
    "I am stronger than this stressful moment.",
    "I give myself permission to rest.",
    "I can ask for help when I need it.",
    "I am doing the best I can right now.",
    "I will focus on what I can do today.",
    "I create space for calm in my mind.",
    "I am safe, here and now.",
    "I can find peace even in busy times."
  ]
};

function Wellbeing({ moodLogs, setMoodLogs, userId }) {
  const [mood, setMood] = useState("Happy");
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/wellbeing?userId=${userId}`)
        .then(r => r.json())
        .then(data => setMoodLogs(data))
        .catch(() => {}); // fallback to localStorage
    }
  }, [userId, setMoodLogs]);

  const logMood = async () => {
    const suggestion = moodSuggestions[mood] || "";
    const affList = affirmationsByMood[mood] || [];
    const affirmation =
      affList[Math.floor(Math.random() * affList.length)] || "";

    const todayIso = new Date().toISOString().slice(0, 10);

    const entry = {
      userId,
      date: todayIso,
      mood,
      suggestion,
      affirmation
    };

    try {
      const res = await fetch("http://localhost:5000/api/wellbeing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const data = await res.json();
        setMoodLogs((prev) => [data.rec, ...prev]);
      }
    } catch (e) {
      setMoodLogs((prev) => [{ ...entry, id: Date.now() }, ...prev]);
    }
  };

  const deleteMoodLog = async (logId) => {
    if (!confirm("Are you sure you want to delete this mood log?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/wellbeing/${logId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMoodLogs(prev => prev.filter(m => (m._id || m.id) !== logId));
      }
    } catch (e) {
      setMoodLogs(prev => prev.filter(m => (m._id || m.id) !== logId));
    }
  };

  const filteredLogs = filterByDate(
    moodLogs,
    (m) => m.date,
    filterType,
    fromDate,
    toDate
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Wellbeing / Mood Tracker</h3>

      <div style={styles.row}>
        <select
          style={styles.input}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option>Happy</option>
          <option>Neutral</option>
          <option>Sad</option>
          <option>Stressed</option>
        </select>
        <button style={styles.primary} onClick={logMood}>
          Log Mood
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...styles.row, marginBottom: 10 }}>
        <select
          style={styles.input}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="week">This week (last 7 days)</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="range">Custom date range</option>
        </select>
        {filterType === "range" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <p style={styles.text}>No mood logs for this selection.</p>
      ) : (
        filteredLogs.map((m) => {
          const displayDate = new Date(m.date).toLocaleDateString();
          return (
            <div key={m.id} style={{ ...styles.moodBox, position: "relative" }}>
              <button
                onClick={() => deleteMoodLog(m._id || m.id)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "#ff6b6b",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12
                }}
              >
                Delete
              </button>
              <p style={{ ...styles.text, fontWeight: 600 }}>
                {displayDate}: {m.mood}
              </p>
              <p style={styles.text}>{m.suggestion}</p>
              {m.affirmation && (
                <p style={{ ...styles.text, fontStyle: "italic" }}>
                  Daily affirmation: {m.affirmation}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function MyBoard({ feedPosts, setFeedPosts, userId, currentUser, events, setEvents }) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("general");
  const [isUploading, setIsUploading] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Event-specific fields
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventColor, setEventColor] = useState("#1976d2");
  const [showEventDialog, setShowEventDialog] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf", "video/mp4", "video/webm"];

  useEffect(() => {
    console.log("MyBoard: Fetching feed...");
    fetch(API_ENDPOINTS.feed)
      .then(r => {
        console.log("MyBoard: Feed fetch response status:", r.status);
        return r.json();
      })
      .then(data => {
        console.log("MyBoard: Feed data received:", data);
        setFeedPosts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("MyBoard: Feed fetch error:", err);
        setFeedPosts([]);
      });
  }, [setFeedPosts]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only images (JPG, PNG, GIF), PDFs, and videos (MP4, WebM) are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const post = async () => {
    if (category === "event") {
      if (!eventName.trim() || !eventDate || !eventTime) {
        alert("Please provide event name, date and time.");
        return;
      }
    } else {
      if (!text.trim() && !selectedFile) {
        alert("Please enter text or select a file.");
        return;
      }
    }

    setIsUploading(true);

    try {
      let mediaData = null;
      let mediaType = null;
      let fileName = null;
      let fileSize = null;

      if (selectedFile) {
        const reader = new FileReader();
        mediaData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        mediaType = selectedFile.type.startsWith("image") ? "image" : 
                   selectedFile.type === "application/pdf" ? "pdf" : "video";
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const newPost = {
        userId,
        userName: currentUser?.name || "Anonymous",
        // For events, include name/date/time in text as a fallback display
        text: category === "event"
          ? `${eventName} — ${eventDate || "(no date)"} ${eventTime || ""}`.trim()
          : text.trim(),
        mediaData,
        mediaType,
        fileName,
        fileSize,
        category,
        // Always send event fields (null when not an event) so backend stores them explicitly
        eventName: category === "event" ? eventName : null,
        eventDate: category === "event" ? eventDate : null,
        eventTime: category === "event" ? eventTime : null,
        eventDescription: category === "event" ? eventDescription : null,
        eventColor: category === "event" ? eventColor : null
      };

      console.log("Posting feed payload", newPost);

      const res = await fetch(API_ENDPOINTS.feed, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Feed post created", data.post);
        setFeedPosts((prev) => [data.post, ...prev]);
        setText("");
        setSelectedFile(null);
        setCategory("general");
        setEventName("");
        setEventDate("");
        setEventTime("");
        setEventDescription("");
        setEventColor("#1976d2");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (isoDate) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleString();
    } catch {
      return isoDate;
    }
  };

  const addEventFromFeed = async (post) => {
    if (!post.eventName || !post.eventDate || !post.eventTime) {
      alert("This event is missing name/date/time. Ask the poster to include them or repost.");
      return;
    }

    try {
      // Add event to local events list
      const newEvent = {
        id: Date.now().toString(),
        userId,
        name: `${post.eventName} (from ${post.userName})`,
        date: post.eventDate,
        time: post.eventTime,
        description: post.eventDescription || `Posted by ${post.userName}`,
        color: post.eventColor || "#1976d2"
      };

      setEvents(prev => [...prev, newEvent]);
      setShowEventDialog(true);
      setTimeout(() => setShowEventDialog(false), 3000);
    } catch (e) {
      console.error("Error adding event:", e);
      alert("Error adding event");
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(API_ENDPOINTS.likeFeed(postId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setFeedPosts(prev => prev.map(p => p._id === postId ? data.post : p));
      }
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(API_ENDPOINTS.commentFeed(postId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          userName: currentUser?.name || "Anonymous",
          text 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setFeedPosts(prev => prev.map(p => p._id === postId ? data.post : p));
        setCommentText(prev => ({ ...prev, [postId]: "" }));
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(API_ENDPOINTS.deleteFeed(postId) + `?userId=${userId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setFeedPosts(prev => prev.filter(p => p._id !== postId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete post");
      }
    } catch (e) {
      console.error("Error deleting post:", e);
    }
  };

  const deleteComment = async (postId, commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(API_ENDPOINTS.deleteComment(postId, commentId) + `?userId=${userId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        const data = await res.json();
        setFeedPosts(prev => prev.map(p => p._id === postId ? data.post : p));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (e) {
      console.error("Error deleting comment:", e);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Student Feed</h3>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
          Share jobs, accommodations, exam tips, study materials, and more with your fellow students
        </p>

        {category === "event" ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Event Name *</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter event name (e.g., Career Fair, Study Session)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Time *</label>
                <input
                  type="time"
                  style={styles.input}
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["#1976d2", "#d32f2f", "#388e3c", "#f57c00", "#7b1fa2"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setEventColor(color)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                      background: color,
                      border: eventColor === color ? "3px solid #333" : "1px solid #ddd",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Description (optional)</label>
              <textarea
                style={{ ...styles.input, height: 80, resize: "vertical", width: "100%", boxSizing: "border-box" }}
                placeholder="Add event details..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <textarea
              style={{ ...styles.input, height: 80, resize: "vertical", width: "100%", boxSizing: "border-box" }}
              placeholder="Share something with the community..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}

        <div style={{ ...styles.row, marginBottom: 12 }}>
          <select
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="job">Job Opportunity</option>
            <option value="accommodation">Accommodation</option>
            <option value="exam">Exam Resources</option>
            <option value="subject">Subject Notes</option>
            <option value="event">Event</option>
          </select>

          <label style={{ ...styles.secondary, cursor: "pointer", marginBottom: 0, padding: "10px 14px" }}>
            📎 Attach File
            <input
              type="file"
              accept="image/*,.pdf,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          <button
            style={styles.primary}
            onClick={post}
            disabled={isUploading}
          >
            {isUploading ? "Posting..." : "Post"}
          </button>
        </div>

        {selectedFile && (
          <div style={{ padding: 10, background: "#f0f0f0", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
            📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
            <button
              onClick={() => setSelectedFile(null)}
              style={{ marginLeft: 10, background: "none", border: "none", color: "red", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Community Posts</h3>

        <div style={{ marginBottom: 16, padding: 12, background: "#f9f9f9", borderRadius: 6 }}>
          <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 600, color: "#333" }}>Filter by Category:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["all", "general", "job", "accommodation", "exam", "subject", "event"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  background: selectedFilter === cat ? "#1976d2" : "#fff",
                  color: selectedFilter === cat ? "white" : "#666",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                {cat === "all" ? "All Posts" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {feedPosts && feedPosts.length === 0 ? (
          <p style={styles.text}>No posts yet. Be the first to share!</p>
        ) : feedPosts && feedPosts.length > 0 ? (
          feedPosts.filter(p => selectedFilter === "all" || (p.category || "general") === selectedFilter).map((p) => (
            <div
              key={p._id || p.id}
              style={{
                marginBottom: 16,
                padding: 14,
                background: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                    {p.userName || "Anonymous"}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#888" }}>
                    {formatDate(p.timestamp)}
                  </p>
                </div>
                {p.category && (
                  <span style={{
                    padding: "4px 10px",
                    background: "#e3f2fd",
                    color: "#1976d2",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {p.category.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Post Text or Event Info */}
              {p.category === "event" ? (
                <div style={{ margin: "10px 0", fontSize: 14, lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 6px 0", fontWeight: 600, fontSize: 16, color: "#333" }}>
                    📅 {p.eventName || p.text || "Event"}
                  </p>
                  <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: 13 }}>
                    📆 {p.eventDate || "Date not set"} {p.eventTime ? `at ${p.eventTime}` : ""}
                  </p>
                  {(p.eventDescription || (!p.eventName && p.text)) && (
                    <p style={{ margin: "8px 0 0 0", color: "#555", fontSize: 13 }}>
                      {p.eventDescription || p.text}
                    </p>
                  )}
                </div>
              ) : (
                p.text && (
                  <p style={{ margin: "10px 0", fontSize: 14, lineHeight: 1.5 }}>
                    {p.text}
                  </p>
                )
              )}

              {/* Media */}
              {p.mediaData && (
                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  {p.mediaType === "image" && (
                    <img
                      src={p.mediaData}
                      alt="Post media"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        borderRadius: 6,
                        objectFit: "cover"
                      }}
                    />
                  )}
                  {p.mediaType === "video" && (
                    <video
                      src={p.mediaData}
                      controls
                      style={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        borderRadius: 6
                      }}
                    />
                  )}
                  {p.mediaType === "pdf" && (
                    <a
                      href={p.mediaData}
                      download={p.fileName}
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        background: "#ff6b6b",
                        color: "white",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      📄 Download PDF: {p.fileName}
                    </a>
                  )}
                </div>
              )}

              {/* File Info */}
              {p.fileSize && !p.mediaData?.startsWith("data:image") && !p.mediaData?.startsWith("data:video") && (
                <p style={{ fontSize: 11, color: "#999", margin: "8px 0 0 0" }}>
                  📄 {p.fileName} · {formatFileSize(p.fileSize)}
                </p>
              )}

              {/* Likes and Comments */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                {/* Like Button and Count */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
                  <button
                    onClick={() => toggleLike(p._id)}
                    style={{
                      background: (p.likes || []).includes(userId) ? "#1976d2" : "#f0f0f0",
                      color: (p.likes || []).includes(userId) ? "white" : "#666",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    👍 {(p.likes || []).includes(userId) ? "Liked" : "Like"} ({(p.likes || []).length})
                  </button>
                  
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [p._id]: !prev[p._id] }))}
                    style={{
                      background: "#f0f0f0",
                      color: "#666",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    💬 Comments ({(p.comments || []).length})
                  </button>

                  {p.category === "event" && (
                    <button
                      onClick={() => addEventFromFeed(p)}
                      style={{
                        background: "#4caf50",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      📅 Add to My Events
                    </button>
                  )}

                  {p.userId === userId && (
                    <button
                      onClick={() => deletePost(p._id)}
                      style={{
                        background: "#ff6b6b",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        marginLeft: "auto"
                      }}
                    >
                      🗑️ Delete Post
                    </button>
                  )}
                </div>

                {/* Comments Section */}
                {showComments[p._id] && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                    {/* Add Comment */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[p._id] || ""}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [p._id]: e.target.value }))}
                        onKeyPress={(e) => e.key === "Enter" && addComment(p._id)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          fontSize: 13
                        }}
                      />
                      <button
                        onClick={() => addComment(p._id)}
                        style={{
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    {(p.comments || []).length === 0 ? (
                      <p style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>No comments yet. Be the first!</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {p.comments.map((comment) => (
                          <div
                            key={comment._id}
                            style={{
                              padding: 10,
                              background: "#f9f9f9",
                              borderRadius: 6,
                              fontSize: 13
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
                                  {comment.userName}
                                </p>
                                <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#888" }}>
                                  {formatDate(comment.createdAt)}
                                </p>
                                <p style={{ margin: "8px 0 0 0", lineHeight: 1.4 }}>
                                  {comment.text}
                                </p>
                              </div>
                              {comment.userId === userId && (
                                <button
                                  onClick={() => deleteComment(p._id, comment._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#ff6b6b",
                                    cursor: "pointer",
                                    fontSize: 11,
                                    padding: 4
                                  }}
                                  title="Delete comment"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={styles.text}>Loading posts...</p>
        )}

          {showEventDialog && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 30,
                  textAlign: "center",
                  maxWidth: 300,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  animation: "slideIn 0.3s ease-out"
                }}
              >
                <p style={{ fontSize: 40, margin: "0 0 16px 0" }}>✅</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#333" }}>
                  Event Added to Calendar!
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "#666" }}>
                  You can view it in your Events section
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

function Diary({ diaryEntries, setDiaryEntries, userId }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/diary?userId=${userId}`)
        .then(r => r.json())
        .then(data => setDiaryEntries(data))
        .catch(() => {}); // fallback to localStorage
    }
  }, [userId, setDiaryEntries]);

  const addEntry = async () => {
    if (!date || !message) {
      alert("Please select a date and write your entry.");
      return;
    }
    const newEntry = {
      userId,
      title: title || "Untitled entry",
      date,
      message
    };
    
    try {
      const res = await fetch("http://localhost:5000/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        const data = await res.json();
        setDiaryEntries((prev) => [data.entry, ...prev]);
      }
    } catch (e) {
      setDiaryEntries((prev) => [{ ...newEntry, id: Date.now() }, ...prev]);
    }
    
    setTitle("");
    setDate("");
    setMessage("");
  };

  const deleteDiary = async (diaryId) => {
    if (!confirm("Are you sure you want to delete this diary entry?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/diary/${diaryId}?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDiaryEntries(prev => prev.filter(d => (d._id || d.id) !== diaryId));
      }
    } catch (e) {
      setDiaryEntries(prev => prev.filter(d => (d._id || d.id) !== diaryId));
    }
  };

  const filteredEntries = filterByDate(
    diaryEntries,
    (d) => d.date,
    filterType,
    fromDate,
    toDate
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Diary / Journal</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <textarea
        style={{ ...styles.input, height: 80, resize: "vertical" }}
        placeholder="Write your thoughts here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <button style={styles.primary} onClick={addEntry}>
          Save Entry
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...styles.row, marginBottom: 10 }}>
        <select
          style={styles.input}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="week">This week (last 7 days)</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="range">Custom date range</option>
        </select>
        {filterType === "range" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <p style={styles.text}>No diary entries for this selection.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {filteredEntries.map((e) => (
            <li key={e._id || e.id} style={{ marginBottom: 16, padding: 12, background: "#f9f9f9", borderRadius: 8, position: "relative" }}>
              <button
                onClick={() => deleteDiary(e._id || e.id)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "#ff6b6b",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12
                }}
              >
                Delete
              </button>
              <p style={{ ...styles.text, fontWeight: 600 }}>
                {e.date} — {e.title}
              </p>
              <p style={styles.text}>{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Profile({ user, avatar, setAvatar, setCurrentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    department: user.department || "",
  });
  const [resetEmail, setResetEmail] = useState(user.email || "");
  const [resetMessage, setResetMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    if (user.avatar && user.avatar !== avatar) {
      setAvatar(user.avatar);
    }
  }, [user.avatar]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") {
        setAvatar(dataUrl);
        try {
          const res = await fetch(API_ENDPOINTS.profile, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id || user.studentId,
              avatar: dataUrl,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
          }
        } catch (err) {
          console.error("Failed to save avatar:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editData.email && !emailRegex.test(editData.email)) {
      setEditMessage("Invalid email format");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.profile, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.studentId,
          ...editData,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setEditMessage(err.error || "Update failed");
        return;
      }

      const data = await res.json();
      setCurrentUser(data.user);
      setEditMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setEditMessage(""), 3000);
    } catch (err) {
      setEditMessage("Failed to update profile: " + err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setResetMessage(err.error || "Reset request failed");
        return;
      }

      setResetMessage("✅ Password reset link sent to your email!");
      setTimeout(() => {
        setResetMessage("");
        setShowPasswordReset(false);
      }, 3000);
    } catch (err) {
      setResetMessage("Error: " + err.message);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Profile</h3>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div>
            <div style={styles.avatarWrapper}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
              ) : (
                <span style={{ fontSize: 32, color: "#777" }}>
                  {user.name?.charAt(0) || "S"}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              style={{
                marginTop: 8,
                display: "inline-block",
                padding: "8px 16px",
                backgroundColor: "#4b7bec",
                color: "white",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Change Photo
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <p style={styles.text}>
                  <strong>Name:</strong> {user.name || "—"}
                </p>
                <p style={styles.text}>
                  <strong>Student ID:</strong> {user.studentId || "—"}
                </p>
                <p style={styles.text}>
                  <strong>Email:</strong> {user.email || "—"}
                </p>
                <p style={styles.text}>
                  <strong>Phone:</strong> {user.phone || "—"}
                </p>
                <p style={styles.text}>
                  <strong>Department:</strong> {user.department || "—"}
                </p>
                <p style={styles.text}>
                  <strong>Batch/Semester:</strong> {user.batch || "—"}
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button style={styles.primary} onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                  <button style={{ ...styles.primary, backgroundColor: "#f39c12" }} onClick={() => setShowPasswordReset(true)}>
                    Change Password
                  </button>
                  <button
                    style={{ ...styles.primary, backgroundColor: "#e74c3c" }}
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Name</label>
                  <input
                    style={styles.input}
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Email</label>
                  <input
                    style={styles.input}
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Phone</label>
                  <input
                    style={styles.input}
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Department</label>
                  <input
                    style={styles.input}
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={styles.primary} onClick={handleUpdateProfile}>
                    Save Changes
                  </button>
                  <button style={styles.secondary} onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>

                {editMessage && <p style={{ marginTop: 10, color: editMessage.includes("successfully") ? "green" : "red" }}>{editMessage}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {showPasswordReset && (
        <div style={{ ...styles.card, marginTop: 20, backgroundColor: "#fff3cd", borderLeft: "4px solid #f39c12" }}>
          <h4 style={{ marginBottom: 16 }}>Reset Password</h4>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
            Enter your email address and we'll send you a password reset link.
          </p>

          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              style={styles.input}
              placeholder="Email address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.primary} onClick={handlePasswordReset}>
              Send Reset Link
            </button>
            <button style={styles.secondary} onClick={() => setShowPasswordReset(false)}>
              Cancel
            </button>
          </div>

          {resetMessage && <p style={{ marginTop: 10, color: resetMessage.includes("✅") ? "green" : "red" }}>{resetMessage}</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    width: "100%",
    height: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#222",
    overflow: "hidden"
  },

  sidebar: {
    width: 230,
    backgroundColor: "#ffffff",
    borderRight: "1px solid #ddd",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflowY: "auto",
    flexShrink: 0
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20
  },
  menuItem: {
    padding: "10px 8px",
    borderRadius: 6,
    marginBottom: 6,
    cursor: "pointer",
    fontSize: 14,
    color: "#333"
  },
  menuActive: {
    backgroundColor: "#4b7bec",
    color: "#fff",
    fontWeight: 600
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box"
  },
  header: {
    height: 70,
    padding: "16px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box"
  },
  headerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700
  },
  headerUser: {
    margin: 0,
    fontSize: 14,
    color: "#555"
  },
  body: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
    boxSizing: "border-box"
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: 20,
    boxSizing: "border-box"
  },
  cardClickable: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    cursor: "pointer",
    boxSizing: "border-box"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 600
  },
  text: {
    margin: "4px 0",
    fontSize: 14
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16
  },

  row: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    alignItems: "center",
    flexWrap: "wrap"
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #bbb",
    flex: 1,
    minWidth: "150px",
    fontSize: 14,
    boxSizing: "border-box"
  },
  primary: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#4b7bec",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap"
  },
  secondary: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #4b7bec",
    backgroundColor: "#ffffff",
    color: "#4b7bec",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    marginTop: 8
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    textAlign: "left"
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px"
  },

  authWrapper: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  authBox: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    width: "90%",
    maxWidth: 420,
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    textAlign: "center",
    overflow: "hidden"
  },

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "2px solid #ddd"
  },

  todoItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: 6
  },

  accomCard: {
    display: "block",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#222",
    boxSizing: "border-box"
  },

  moodBox: {
    borderRadius: 8,
    border: "1px solid #eee",
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafafa",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  },

  // Calendar header styles
  calHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  calHeaderControls: {
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  calHeaderCenter: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 20,
    fontWeight: 600
  },
  calHeaderLabel: {
    cursor: "pointer"
  },
  calNavButton: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 13
  },
  calIconButton: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1
  },

  // Month / Year picker overlay
  pickerOverlay: {
    position: "absolute",
    top: 88,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    padding: 12,
    zIndex: 20
  },
  pickerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8
  },
  pickerCell: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ddd",
    backgroundColor: "#fafafa",
    cursor: "pointer",
    fontSize: 13
  },
  pickerCellActive: {
    backgroundColor: "#4b7bec",
    color: "#ffffff",
    borderColor: "#4b7bec"
  }
};
