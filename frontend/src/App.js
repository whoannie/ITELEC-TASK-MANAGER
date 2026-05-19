import React, { useEffect, useState } from 'react';
import './App.css';

function App() {

  const API_URL = process.env.REACT_APP_API_URL;

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');

  // FETCH TASKS
  const fetchTasks = async () => {
    const response = await fetch(`${API_URL}/api/tasks/`)
    const data = await response.json();

    const updatedTasks = data.map(task => ({
      ...task,
      timer: 0,
      initialTime: 0,
      running: false,
      done: false
    }));

    setTasks(updatedTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // TIMER
  useEffect(() => {
    const interval = setInterval(() => {

      setTasks(prevTasks =>
        prevTasks.map(task => {

          // ✅ TASK COMPLETE FIRST
          if (task.running && task.timer === 1) {
            return {
              ...task,
              timer: 0,
              running: false,
              done: true
            };
          }

          // ✅ COUNTDOWN
          if (task.running && task.timer > 1) {
            return {
              ...task,
              timer: task.timer - 1
            };
          }

          return task;
        })
      );

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // FORMAT TIME
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // PROGRESS %
  const getProgress = (task) => {
    if (task.initialTime === 0) return 0;
    return ((task.initialTime - task.timer) / task.initialTime) * 100;
  };

  // ADD TASK
  const addTask = async () => {

    if (!title || !minutes) return;

    await fetch(`${API_URL}/api/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        is_completed: false
      }),
    });

    const response = await fetch(`${API_URL}/api/tasks/`);
    const data = await response.json();

    const newestTask = data[data.length - 1];
    const totalSeconds = parseInt(minutes) * 60;

    setTasks(prev => [
      ...prev,
      {
        ...newestTask,
        timer: totalSeconds,
        initialTime: totalSeconds,
        running: false,
        done: false
      }
    ]);

    setTitle('');
    setMinutes('');
  };

  // START
  const startTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId && !task.done
          ? { ...task, running: true }
          : task
      )
    );
  };

  // PAUSE
  const pauseTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, running: false }
          : task
      )
    );
  };

  // DELETE
  const deleteTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.filter(task => task.id !== taskId)
    );
  };

  return (
    <div className="container">
      <div className="card">

        <h1>✨ Magical Task Timer ✨</h1>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter your magical task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="minute-input"
          />

          <button onClick={addTask}>Add</button>
        </div>

        <div className="task-list">

          {tasks.map(task => (

            <div
              key={task.id}
              className={`task-card
                ${task.running ? 'active' : ''}
                ${task.done ? 'done' : ''}
              `}
            >
              {/* 🎉 CONFETTI GOES HERE */}
              {task.done && (
              <>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="confetti"></div>
                                ))}
                 </>
                   )}

              <div className="task-header">
                <h3>
                  {task.done ? '✅' : '🌸'} {task.title}
                </h3>

                {task.done && (
                  <span className="done-badge">
                    DONE
                  </span>
                )}
              </div>

              <p className="timer">
                {task.done
                  ? 'Task Completed 🎉'
                  : `⏰ ${formatTime(task.timer)}`
                }
              </p>

              {/* ✅ PROGRESS BAR */}
              {!task.done && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgress(task)}%` }}
                  ></div>
                </div>
              )}

              <div className="actions">

                {!task.done && (
                  <button
                    className="start-btn"
                    onClick={() =>
                      task.running
                        ? pauseTask(task.id)
                        : startTask(task.id)
                    }
                  >
                    {task.running ? '⏸ Pause' : '▶ Start'}
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  🗑 Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}

export default App;