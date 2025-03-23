import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GoalsDash = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title:'', description:'', deadline:'' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get('/api/goals', {
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data);
    } catch(err) {
      console.error('Error fetching goals:', err);
    }
  };

  const handleChange = e => setNewGoal({...newGoal,[e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/goals', newGoal, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Add the newly created goal to the state for instant update
      setGoals(prevGoals => [...prevGoals, res.data]);

      // Reset form fields
      setNewGoal({ title: '', description: '', deadline: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const updateProgress = async (goalId, progressValue) => {
    try{
      await axios.put(`/api/goals/${goalId}`,{ progress:progressValue },{
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }
      });
      fetchGoals();
    }catch(err){
      console.error('Error updating progress:', err);
    }
  };

  return (
    <div className="goals-section">
      {!showForm ? (
        <button 
          className="add-goal-button" 
          onClick={() => setShowForm(true)}
        >
          Add New Goal
        </button>
      ) : (
        <form className="goals-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Goal Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Enter your goal title"
              value={newGoal.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your goal"
              value={newGoal.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Target Date</label>
            <input
              id="deadline"
              type="date"
              name="deadline"
              className="date-input"
              value={newGoal.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="goals-form-buttons">
            <button type="submit">Create Goal</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Existing Goals List with Progress Update */}
      <div className="goals-list">
        {goals.map(goal => (
          <div key={goal._id} className="goal-item">
            <div className="goal-header">
              <h3 className="goal-title">{goal.title}</h3>
              <span className={`goal-status ${goal.progress === 100 ? 'status-completed' : 'status-in-progress'}`}>
                {goal.progress === 100 ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <p className="goal-details">{goal.description}</p>
            <p className="goal-date">Target Date: {new Date(goal.deadline).toLocaleDateString()}</p>
            <div className="goal-progress">
              <p>Progress: {goal.progress}%</p>
              <div className="progress-update">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  defaultValue={goal.progress}
                  id={`progress-${goal._id}`}
                />
                <button 
                  className="update-button"
                  onClick={() => {
                    const input = document.getElementById(`progress-${goal._id}`);
                    const newProgress = parseInt(input.value,10);
                    if(newProgress >=0 && newProgress <=100){
                      updateProgress(goal._id,newProgress);
                    }else{
                      alert("Please enter a valid progress value (0-100).");
                    }
                  }}
                >
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="no-goals-message">You haven't set any study goals yet. Add your first goal to get started!</p>
        )}
      </div>
    </div>
  );
};

export default GoalsDash;
