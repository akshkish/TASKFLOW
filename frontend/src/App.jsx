import { useEffect, useRef, useState } from "react";
import "./App.css";
import Auth from "./Auth";

const ambientModes = {
    rain: {
        icon: "🌧️",
        name: "RAIN",
        description: "Soft rainy window",
        color: "rain",
    },
    cafe: {
        icon: "☕",
        name: "CAFE",
        description: "Cozy coffee shop",
        color: "cafe",
    },
    fire: {
        icon: "🔥",
        name: "FIRE",
        description: "Warm fireplace",
        color: "fire",
    },
    ocean: {
        icon: "🌊",
        name: "OCEAN",
        description: "Calm ocean waves",
        color: "ocean",
    },
    forest: {
        icon: "🌲",
        name: "FOREST",
        description: "Night forest",
        color: "forest",
    },
    keyboard: {
        icon: "⌨️",
        name: "KEYS",
        description: "Mechanical typing",
        color: "keyboard",
    },
};

const defaultAudio = {
    rain: { active: false, volume: 0.35 },
    cafe: { active: false, volume: 0.2 },
    fire: { active: false, volume: 0.25 },
    ocean: { active: false, volume: 0.35 },
    forest: { active: false, volume: 0.2 },
    keyboard: { active: false, volume: 0.15 },
};

function App() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [editId, setEditId] = useState(null);

    const [darkMode, setDarkMode] = useState(true);

    const [pomodoroMode, setPomodoroMode] = useState(
        localStorage.getItem("pomodoroMode") || "work"
    );

    const [pomodoroSeconds, setPomodoroSeconds] = useState(
        Number(localStorage.getItem("pomodoroSeconds")) ||
            25 * 60
    );

    const [pomodoroRunning, setPomodoroRunning] =
        useState(false);

    const [sessions, setSessions] = useState(
        Number(localStorage.getItem("pomodoroSessions")) || 0
    );

    const [audio, setAudio] = useState(() => {
        try {
            return (
                JSON.parse(
                    localStorage.getItem("taskflowAudio")
                ) || defaultAudio
            );
        } catch {
            return defaultAudio;
        }
    });

    const [masterVolume, setMasterVolume] = useState(
        Number(localStorage.getItem("taskflowMaster")) || 0.7
    );

    const [youtubeUrl, setYoutubeUrl] = useState(
        localStorage.getItem("taskflowYoutube") || ""
    );

    const [youtubeInput, setYoutubeInput] = useState("");

    const [showYoutube, setShowYoutube] = useState(
        !!localStorage.getItem("taskflowYoutube")
    );

    const audioContextRef = useRef(null);
    const audioEngineRef = useRef({});

    const token = localStorage.getItem("token");

    /* =========================
       TASKS
    ========================= */

    useEffect(() => {
        if (!user || !token) return;

        fetch("http://localhost:5000/api/tasks", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTasks(data);
                }
            });
    }, [user, token]);

    /* =========================
       SAVE AUDIO SETTINGS
    ========================= */

    useEffect(() => {
        localStorage.setItem(
            "taskflowAudio",
            JSON.stringify(audio)
        );
    }, [audio]);

    useEffect(() => {
        localStorage.setItem(
            "taskflowMaster",
            masterVolume
        );
    }, [masterVolume]);

    /* =========================
       POMODORO
    ========================= */

    useEffect(() => {
        localStorage.setItem(
            "pomodoroSeconds",
            pomodoroSeconds
        );

        localStorage.setItem(
            "pomodoroMode",
            pomodoroMode
        );
    }, [pomodoroSeconds, pomodoroMode]);

    useEffect(() => {
        if (!pomodoroRunning) return;

        if (pomodoroSeconds <= 0) {
            completePomodoro();
            return;
        }

        const timer = setInterval(() => {
            setPomodoroSeconds((seconds) => seconds - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [pomodoroRunning, pomodoroSeconds]);

    const getModeDuration = (mode) => {
        if (mode === "work") return 25 * 60;
        if (mode === "short") return 5 * 60;
        return 10 * 60;
    };

    const switchPomodoroMode = (mode) => {
        setPomodoroRunning(false);
        setPomodoroMode(mode);
        setPomodoroSeconds(getModeDuration(mode));
    };

    const completePomodoro = () => {
        setPomodoroRunning(false);
        playBeep();

        if (pomodoroMode === "work") {
            setSessions((current) => {
                const next = current + 1;

                localStorage.setItem(
                    "pomodoroSessions",
                    next
                );

                return next;
            });
        }

        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification(
                    "TaskFlow Focus Complete 🍅",
                    {
                        body:
                            pomodoroMode === "work"
                                ? "Great work! Time for a break."
                                : "Break complete. Ready to focus?",
                    }
                );
            }
        }

        if (pomodoroMode === "work") {
            switchPomodoroMode("short");
        } else {
            switchPomodoroMode("work");
        }
    };

    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    };

    const formatTime = () => {
        const minutes = Math.floor(
            pomodoroSeconds / 60
        );

        const seconds = pomodoroSeconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}`;
    };

    /* =========================
       AUDIO ENGINE
    ========================= */

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }

        return audioContextRef.current;
    };

    const createNoise = (context, type) => {
        const bufferSize = context.sampleRate * 2;

        const buffer = context.createBuffer(
            1,
            bufferSize,
            context.sampleRate
        );

        const data = buffer.getChannelData(0);

        let last = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            if (type === "brown") {
                last =
                    (last + 0.02 * white) /
                    1.02;

                data[i] = last * 3.5;
            } else {
                data[i] = white;
            }
        }

        const source =
            context.createBufferSource();

        source.buffer = buffer;
        source.loop = true;

        return source;
    };

    const startSound = (mode) => {
        if (audioEngineRef.current[mode]) {
            return;
        }

        const context = getAudioContext();

        if (context.state === "suspended") {
            context.resume();
        }

        const noise = createNoise(
            context,
            mode === "rain" ||
                mode === "ocean" ||
                mode === "forest"
                ? "brown"
                : "white"
        );

        const filter =
            context.createBiquadFilter();

        const gain =
            context.createGain();

        if (mode === "rain") {
            filter.type = "lowpass";
            filter.frequency.value = 1800;
        }

        if (mode === "ocean") {
            filter.type = "lowpass";
            filter.frequency.value = 600;
        }

        if (mode === "forest") {
            filter.type = "lowpass";
            filter.frequency.value = 900;
        }

        if (mode === "fire") {
            filter.type = "lowpass";
            filter.frequency.value = 700;
        }

        if (mode === "cafe") {
            filter.type = "bandpass";
            filter.frequency.value = 900;
        }

        if (mode === "keyboard") {
            filter.type = "bandpass";
            filter.frequency.value = 1800;
        }

        gain.gain.value =
            audio[mode].volume *
            masterVolume;

        noise
            .connect(filter)
            .connect(gain)
            .connect(context.destination);

        noise.start();

        audioEngineRef.current[mode] = {
            noise,
            gain,
        };
    };

    const stopSound = (mode) => {
        const sound =
            audioEngineRef.current[mode];

        if (!sound) return;

        try {
            sound.noise.stop();
        } catch {}

        try {
            sound.noise.disconnect();
            sound.gain.disconnect();
        } catch {}

        delete audioEngineRef.current[mode];
    };

    const toggleSound = (mode) => {
        setAudio((current) => ({
            ...current,
            [mode]: {
                ...current[mode],
                active: !current[mode].active,
            },
        }));

        if (audio[mode].active) {
            stopSound(mode);
        } else {
            startSound(mode);
        }
    };

    const changeVolume = (mode, value) => {
        const numericValue = Number(value);

        setAudio((current) => ({
            ...current,
            [mode]: {
                ...current[mode],
                volume: numericValue,
            },
        }));

        const sound =
            audioEngineRef.current[mode];

        if (sound) {
            sound.gain.gain.value =
                numericValue *
                masterVolume;
        }
    };

    const changeMasterVolume = (value) => {
        const numericValue = Number(value);

        setMasterVolume(numericValue);

        Object.keys(
            audioEngineRef.current
        ).forEach((mode) => {
            const sound =
                audioEngineRef.current[mode];

            sound.gain.gain.value =
                audio[mode].volume *
                numericValue;
        });
    };

    const stopAllAudio = () => {
        Object.keys(
            audioEngineRef.current
        ).forEach((mode) => {
            stopSound(mode);
        });

        setAudio((current) => {
            const updated = { ...current };

            Object.keys(updated).forEach(
                (mode) => {
                    updated[mode] = {
                        ...updated[mode],
                        active: false,
                    };
                }
            );

            return updated;
        });
    };

    const playBeep = () => {
        const context = getAudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.frequency.value = 880;

        gain.gain.setValueAtTime(
            0.25,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 1
        );

        oscillator
            .connect(gain)
            .connect(context.destination);

        oscillator.start();

        oscillator.stop(
            context.currentTime + 1
        );
    };

    /* =========================
       TASK CRUD
    ========================= */

    const addTask = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "http://localhost:5000/api/tasks",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                }),
            }
        );

        const newTask =
            await response.json();

        if (!response.ok) return;

        setTasks([
            ...tasks,
            newTask,
        ]);

        setTitle("");
        setDescription("");
        setPriority("Medium");
    };

    const deleteTask = async (id) => {
        const response = await fetch(
            `http://localhost:5000/api/tasks/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) return;

        setTasks(
            tasks.filter(
                (task) =>
                    task._id !== id
            )
        );
    };

    const editTask = (task) => {
        setEditId(task._id);
        setTitle(task.title);
        setDescription(
            task.description || ""
        );
        setPriority(task.priority);
    };

    const updateTask = async (e) => {
        e.preventDefault();

        const response = await fetch(
            `http://localhost:5000/api/tasks/${editId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                }),
            }
        );

        const updatedTask =
            await response.json();

        if (!response.ok) return;

        setTasks(
            tasks.map((task) =>
                task._id === editId
                    ? updatedTask
                    : task
            )
        );

        setEditId(null);
        setTitle("");
        setDescription("");
        setPriority("Medium");
    };

    const updateStatus = async (
        id,
        status
    ) => {
        const response = await fetch(
            `http://localhost:5000/api/tasks/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                }),
            }
        );

        const updatedTask =
            await response.json();

        if (!response.ok) return;

        setTasks(
            tasks.map((task) =>
                task._id === id
                    ? updatedTask
                    : task
            )
        );
    };

    /* =========================
       YOUTUBE
    ========================= */

    const getYoutubeEmbed = (url) => {
        if (!url) return null;

        const playlistMatch =
            url.match(
                /[?&]list=([^&]+)/
            );

        if (playlistMatch) {
            return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
        }

        const videoMatch =
            url.match(
                /(?:v=|youtu\.be\/|shorts\/)([^&?/]+)/
            );

        if (videoMatch) {
            return `https://www.youtube.com/embed/${videoMatch[1]}`;
        }

        return null;
    };

    const saveYoutube = () => {
        const embed =
            getYoutubeEmbed(
                youtubeInput
            );

        if (!embed) {
            alert(
                "Enter a valid YouTube video or playlist URL."
            );

            return;
        }

        setYoutubeUrl(
            youtubeInput
        );

        localStorage.setItem(
            "taskflowYoutube",
            youtubeInput
        );

        setYoutubeInput("");
        setShowYoutube(true);
    };

    /* =========================
       LOGOUT
    ========================= */

    const logout = () => {
        stopAllAudio();

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        setUser(null);
        setTasks([]);
    };

    const totalTasks = tasks.length;

    const todoTasks =
        tasks.filter(
            (task) =>
                task.status === "Todo"
        ).length;

    const progressTasks =
        tasks.filter(
            (task) =>
                task.status ===
                "In Progress"
        ).length;

    const doneTasks =
        tasks.filter(
            (task) =>
                task.status === "Done"
        ).length;

    const activeSounds =
        Object.keys(audio).filter(
            (mode) =>
                audio[mode].active
        );

    if (!user) {
        return (
            <Auth
                onLogin={setUser}
            />
        );
    }

    return (
        <div
            className={`app ${
                darkMode
                    ? "dark"
                    : "light"
            } ${
                activeSounds.length
                    ? `ambience-${activeSounds[0]}`
                    : ""
            }`}
        >

            {/* PIXEL BACKGROUND */}

            {audio.rain.active && (
                <div className="rain-layer">
                    {Array.from({
                        length: 80,
                    }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                left: `${(
                                    i * 37
                                ) % 100}%`,
                                animationDelay:
                                    `${(
                                        i * 0.13
                                    ) % 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {audio.fire.active && (
                <div className="fire-layer">
                    {Array.from({
                        length: 35,
                    }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                left: `${(
                                    i * 29
                                ) % 100}%`,
                                animationDelay:
                                    `${(
                                        i * 0.17
                                    ) % 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {audio.ocean.active && (
                <div className="ocean-layer">
                    <div className="pixel-wave wave-one" />
                    <div className="pixel-wave wave-two" />
                    <div className="pixel-wave wave-three" />
                </div>
            )}

            {audio.forest.active && (
                <div className="forest-layer">
                    ✦　✧　✦　✧　✦　✧
                </div>
            )}

            <div className="pixel-cloud cloud-one" />
            <div className="pixel-cloud cloud-two" />

            <div className="container">

                {/* HEADER */}

                <header className="header">

                    <div>
                        <div className="logo">
                            TASKFLOW
                        </div>

                        <div className="subtitle">
                            Welcome back,{" "}
                            {user.name}!
                        </div>
                    </div>

                    <div className="header-actions">

                        <button
                            className="theme-button"
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                        >
                            {darkMode
                                ? "☀ LIGHT"
                                : "🌙 DARK"}
                        </button>

                        <button
                            className="theme-button"
                            onClick={
                                logout
                            }
                        >
                            LOGOUT
                        </button>

                    </div>

                </header>

                {/* NAV */}

                <nav className="focus-nav">

                    <a href="#tasks">
                        ▣ TASKS
                    </a>

                    <a href="#pomodoro">
                        🍅 FOCUS
                    </a>

                    <a href="#lofi">
                        🎧 LOFI
                    </a>

                    <a href="#ambient">
                        ✨ AMBIENT
                    </a>

                </nav>

                {/* DASHBOARD */}

                <section className="dashboard">

                    <div className="dashboard-card task-stat">

                        <div className="pixel-icon">
                            ▣
                        </div>

                        <h3>
                            TASKS
                        </h3>

                        <strong>
                            {totalTasks}
                        </strong>

                        <small>
                            {doneTasks} completed
                        </small>

                    </div>

                    <div
                        className={`dashboard-card pomodoro-card ${
                            pomodoroRunning
                                ? "timer-running"
                                : ""
                        }`}
                        id="pomodoro"
                    >

                        <div className="tomato">
                            🍅
                        </div>

                        <h3>
                            {pomodoroMode ===
                            "work"
                                ? "FOCUS"
                                : "BREAK"}
                        </h3>

                        <div className="timer">
                            {formatTime()}
                        </div>

                        <div className="pomodoro-modes">

                            <button
                                className={
                                    pomodoroMode ===
                                    "work"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    switchPomodoroMode(
                                        "work"
                                    )
                                }
                            >
                                25
                            </button>

                            <button
                                className={
                                    pomodoroMode ===
                                    "short"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    switchPomodoroMode(
                                        "short"
                                    )
                                }
                            >
                                5
                            </button>

                            <button
                                className={
                                    pomodoroMode ===
                                    "long"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    switchPomodoroMode(
                                        "long"
                                    )
                                }
                            >
                                10
                            </button>

                        </div>

                        <div className="timer-actions">

                            <button
                                onClick={() => {
                                    requestNotificationPermission();

                                    setPomodoroRunning(
                                        !pomodoroRunning
                                    );
                                }}
                            >
                                {pomodoroRunning
                                    ? "PAUSE"
                                    : "START"}
                            </button>

                            <button
                                onClick={() =>
                                    switchPomodoroMode(
                                        pomodoroMode
                                    )
                                }
                            >
                                RESET
                            </button>

                        </div>

                        <small>
                            🍅 {sessions} sessions
                        </small>

                    </div>

                    <div className="dashboard-card audio-stat">

                        <div className="pixel-icon">
                            🎧
                        </div>

                        <h3>
                            AUDIO
                        </h3>

                        <strong>
                            {activeSounds.length}
                        </strong>

                        <small>
                            {activeSounds.length
                                ? "sounds playing"
                                : "nothing playing"}
                        </small>

                    </div>

                </section>

                {/* TASK FORM */}

                <section
                    className="form-container"
                    id="tasks"
                >

                    <div className="section-heading">
                        <span>▣</span>

                        <h2>
                            {editId
                                ? "EDIT TASK"
                                : "CREATE NEW TASK"}
                        </h2>
                    </div>

                    <form
                        className="task-form"
                        onSubmit={
                            editId
                                ? updateTask
                                : addTask
                        }
                    >

                        <input
                            type="text"
                            placeholder="TASK TITLE"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <input
                            type="text"
                            placeholder="DESCRIPTION"
                            value={
                                description
                            }
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                        />

                        <select
                            value={
                                priority
                            }
                            onChange={(e) =>
                                setPriority(
                                    e.target.value
                                )
                            }
                        >
                            <option value="Low">
                                LOW
                            </option>

                            <option value="Medium">
                                MEDIUM
                            </option>

                            <option value="High">
                                HIGH
                            </option>
                        </select>

                        <button
                            className="primary-button"
                            type="submit"
                        >
                            {editId
                                ? "UPDATE TASK"
                                : "+ ADD TASK"}
                        </button>

                    </form>

                </section>

                {/* TASKS */}

                <section className="tasks-section">

                    <div className="section-heading">
                        <span>▣</span>

                        <h2>
                            YOUR TASKS
                        </h2>
                    </div>

                    <div className="task-summary">

                        <span>
                            ALL {totalTasks}
                        </span>

                        <span>
                            TODO {todoTasks}
                        </span>

                        <span>
                            ACTIVE{" "}
                            {progressTasks}
                        </span>

                        <span>
                            DONE {doneTasks}
                        </span>

                    </div>

                    <div className="tasks-grid">

                        {tasks.length ===
                        0 ? (
                            <div className="empty-state">
                                <div>
                                    ✦
                                </div>

                                <h3>
                                    NO TASKS YET
                                </h3>

                                <p>
                                    Create your first
                                    task and start
                                    focusing.
                                </p>
                            </div>
                        ) : (
                            tasks.map(
                                (task) => (
                                    <div
                                        className="task-card"
                                        key={
                                            task._id
                                        }
                                    >

                                        <div className="task-card-top">

                                            <h3>
                                                {
                                                    task.title
                                                }
                                            </h3>

                                            <span
                                                className={`priority ${task.priority.toLowerCase()}`}
                                            >
                                                {
                                                    task.priority
                                                }
                                            </span>

                                        </div>

                                        <p className="description">
                                            {task.description ||
                                                "No description"}
                                        </p>

                                        <select
                                            className="status-select"
                                            value={
                                                task.status
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateStatus(
                                                    task._id,
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="Todo">
                                                TODO
                                            </option>

                                            <option value="In Progress">
                                                IN PROGRESS
                                            </option>

                                            <option value="Done">
                                                DONE
                                            </option>
                                        </select>

                                        <div className="actions">

                                            <button
                                                className="edit-button"
                                                onClick={() =>
                                                    editTask(
                                                        task
                                                    )
                                                }
                                            >
                                                EDIT
                                            </button>

                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    deleteTask(
                                                        task._id
                                                    )
                                                }
                                            >
                                                DELETE
                                            </button>

                                        </div>

                                    </div>
                                )
                            )
                        )}

                    </div>

                </section>

                {/* LOFI */}

                <section
                    className="media-section"
                    id="lofi"
                >

                    <div className="section-heading">
                        <span>🎧</span>

                        <h2>
                            LO-FI PLAYER
                        </h2>
                    </div>

                    <div className="youtube-box">

                        <div className="youtube-title">

                            <div className="youtube-icon">
                                ▶
                            </div>

                            <div>
                                <h3>
                                    YOUTUBE LO-FI
                                </h3>

                                <p>
                                    Add your favourite
                                    video or playlist.
                                </p>
                            </div>

                        </div>

                        <div className="youtube-input">

                            <input
                                placeholder="Paste YouTube URL..."
                                value={
                                    youtubeInput
                                }
                                onChange={(e) =>
                                    setYoutubeInput(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                onClick={
                                    saveYoutube
                                }
                            >
                                SAVE
                            </button>

                        </div>

                    </div>

                    {showYoutube &&
                        getYoutubeEmbed(
                            youtubeUrl
                        ) && (
                            <div className="youtube-player">

                                <iframe
                                    src={
                                        getYoutubeEmbed(
                                            youtubeUrl
                                        )
                                    }
                                    title="TaskFlow Lo-fi"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />

                                <button
                                    className="remove-youtube"
                                    onClick={() => {
                                        localStorage.removeItem(
                                            "taskflowYoutube"
                                        );

                                        setYoutubeUrl(
                                            ""
                                        );

                                        setShowYoutube(
                                            false
                                        );
                                    }}
                                >
                                    REMOVE
                                </button>

                            </div>
                        )}

                </section>

                {/* AMBIENT */}

                <section
                    className="media-section"
                    id="ambient"
                >

                    <div className="section-heading">
                        <span>✨</span>

                        <h2>
                            AMBIENT WORLD
                        </h2>
                    </div>

                    <div className="master-volume">

                        <span>
                            🔊 MASTER
                        </span>

                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={
                                masterVolume
                            }
                            onChange={(e) =>
                                changeMasterVolume(
                                    e.target.value
                                )
                            }
                        />

                        <span>
                            {Math.round(
                                masterVolume *
                                    100
                            )}
                            %
                        </span>

                    </div>

                    <div className="ambient-grid">

                        {Object.entries(
                            ambientModes
                        ).map(
                            ([
                                id,
                                sound,
                            ]) => (
                                <div
                                    className={`ambient-card ${
                                        audio[id]
                                            .active
                                            ? "active"
                                            : ""
                                    } ambient-${sound.color}`}
                                    key={id}
                                >

                                    <button
                                        className="ambient-main"
                                        onClick={() =>
                                            toggleSound(
                                                id
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                sound.icon
                                            }
                                        </span>

                                        <strong>
                                            {
                                                sound.name
                                            }
                                        </strong>

                                        <small>
                                            {
                                                audio[
                                                    id
                                                ]
                                                    .active
                                                    ? "● PLAYING"
                                                    : "○ OFF"
                                            }
                                        </small>

                                    </button>

                                    <div className="volume-control">

                                        <span>
                                            🔉
                                        </span>

                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={
                                                audio[
                                                    id
                                                ]
                                                    .volume
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                changeVolume(
                                                    id,
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                    {activeSounds.length >
                        0 && (
                        <div className="now-playing">

                            <div>
                                <strong>
                                    NOW PLAYING
                                </strong>

                                <p>
                                    {activeSounds
                                        .map(
                                            (mode) =>
                                                ambientModes[
                                                    mode
                                                ]
                                                    .icon +
                                                " " +
                                                ambientModes[
                                                    mode
                                                ]
                                                    .name
                                        )
                                        .join(
                                            "  •  "
                                        )}
                                </p>
                            </div>

                            <button
                                onClick={
                                    stopAllAudio
                                }
                            >
                                STOP ALL
                            </button>

                        </div>
                    )}

                </section>

                <footer>
                    TASKFLOW • FOCUS YOUR WORLD
                </footer>

            </div>
        </div>
    );
}

export default App;