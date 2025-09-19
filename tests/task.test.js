const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

let testUser;
let testUserId;
let authToken;


beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp_test';
  await mongoose.connect(url);
});


beforeEach(async () => {
  
  await User.deleteMany({});
  await Task.deleteMany({});
  
 
  testUser = await User.create({
    username: 'testuser',
    passwordHash: 'password123'
  });
  testUserId = testUser._id;
});


afterAll(async () => {
  await mongoose.connection.close();
});

describe('Tasks', () => {
  describe('GET /tasks', () => {
    it('should redirect to login if not authenticated', async () => {
      const res = await request(app)
        .get('/tasks');
      
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/login');
    });
  });

  describe('POST /tasks/create', () => {
    it('should create a new task successfully', async () => {
      
      const loginRes = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      
      const res = await request(app)
        .post('/tasks/create')
        .send({
          title: 'Test Task',
          description: 'This is a test task'
        })
        .set('Cookie', loginRes.headers['set-cookie']);
      
      expect(res.statusCode).toBe(302);
      
      
      const task = await Task.findOne({ title: 'Test Task' });
      expect(task).not.toBeNull();
      expect(task.userId.toString()).toBe(testUserId.toString());
      expect(task.status).toBe('pending');
    });

    it('should not create task without title', async () => {
      
      const loginRes = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      
      const res = await request(app)
        .post('/tasks/create')
        .send({
          description: 'This is a test task'
        })
        .set('Cookie', loginRes.headers['set-cookie']);
      
      expect(res.statusCode).toBe(302); 
    });
  });

  describe('POST /tasks/:id/status', () => {
    let testTask;
    
    beforeEach(async () => {
      
      testTask = await Task.create({
        userId: testUserId,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending'
      });
    });

    it('should update task status successfully', async () => {
      
      const loginRes = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
     
      const res = await request(app)
        .post(`/tasks/${testTask._id}/status`)
        .send({
          status: 'completed'
        })
        .set('Cookie', loginRes.headers['set-cookie']);
      
      expect(res.statusCode).toBe(302);
      
      
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.status).toBe('completed');
    });

    it('should not update task status to invalid value', async () => {
      
      const loginRes = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
     
      const res = await request(app)
        .post(`/tasks/${testTask._id}/status`)
        .send({
          status: 'invalid'
        })
        .set('Cookie', loginRes.headers['set-cookie']);
      
      expect(res.statusCode).toBe(400);
    });
  });
});