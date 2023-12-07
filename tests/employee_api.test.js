import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../app'

const testApi = supertest(app)

test('Employees re returned as json', async () => {
    await testApi
        .get('/api/employees')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

afterAll(async () => {
    await mongoose.connection.close()
})
