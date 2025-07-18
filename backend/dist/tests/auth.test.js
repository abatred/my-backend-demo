"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app"); // Your Express app instance
const database_1 = require("../config/database"); // Direct import for sequelize
const User_1 = require("../models/User"); // Import the User model
beforeAll(async () => {
    await database_1.sequelize.sync({ force: true });
    console.log('Database synced for tests');
});
afterEach(async () => {
    // Clean up the User table after each test to ensure test isolation
    await User_1.User.destroy({ truncate: true, cascade: true });
    console.log('User table truncated after test');
});
afterAll(async () => {
    // Close the database connection after all tests are done
    await database_1.sequelize.close();
    console.log('Database connection closed after all tests');
});
describe('Auth Routes', () => {
    it('should allow a user to sign up', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123!',
            termsAccepted: true
        };
        const response = await (0, supertest_1.default)(app_1.app)
            .post('/auth/signup')
            .send(userData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('email', userData.email);
        // Verify user is in the database
        const userInDb = await User_1.User.findOne({ where: { email: userData.email } });
        expect(userInDb).not.toBeNull();
        expect(userInDb === null || userInDb === void 0 ? void 0 : userInDb.get('email')).toBe(userData.email);
    });
    it('should not allow signup with an existing email', async () => {
        // First, sign up a user
        const userData = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Password123!',
            termsAccepted: true
        };
        await (0, supertest_1.default)(app_1.app)
            .post('/auth/signup')
            .send(userData);
        // Try to sign up again with the same email
        const response = await (0, supertest_1.default)(app_1.app)
            .post('/auth/signup')
            .send(userData);
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty('error', 'User with this email already exists.');
    });
});
