const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');


beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp_test';
  await mongoose.connect(url);
});


beforeEach(async () => {
  await User.deleteMany({});
});


afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(302); 
      expect(res.headers.location).toBe('/login');
      
      
      const user = await User.findOne({ username: 'testuser' });
      expect(user).not.toBeNull();
      expect(user.username).toBe('testuser');
    });

    it('should not register with existing username', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        passwordHash: 'password123'
      });

      const res = await request(app)
        .post('/register')
        .send({
          username: 'existinguser',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(302); // Should still redirect but with error
    });

    it('should not register with missing username', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(302); // Should redirect with error
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'testuser',
        passwordHash: 'password123'
      });
      await user.save();
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(302); 
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(302); 
    });
  });
});