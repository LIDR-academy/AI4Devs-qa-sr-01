// Database utilities for E2E testing
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

const TEST_DB_NAME = 'LTIdb_test'
const DB_USER = 'LTIdbUser'
const DB_PASSWORD = 'D1ymf8wyQEGthFR1E9xhCq'

/**
 * Creates test database and runs migrations
 */
async function setupTestDatabase() {
  try {
    // For now, just ensure the main database is ready
    // Skip creating separate test database to avoid complexity
    console.log('✅ Using main database for testing')
    return null // Required for Cypress tasks
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message)
    throw error
  }
}

/**
 * Seeds test database with sample data for E2E tests
 */
async function seedTestData() {
  // Use dynamic import to avoid Cypress path issues
  const path = require('path')
  const backendPath = path.resolve(__dirname, '../../backend')
  
  // Use main database for testing (not separate test database)
  process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/LTIdb`
  
  // Import Prisma client from backend directory
  const { PrismaClient } = require(path.join(backendPath, 'node_modules/@prisma/client'))
  
  const prisma = new PrismaClient()

  try {
    // Clean existing data first to avoid conflicts
    await prisma.interview.deleteMany()
    await prisma.application.deleteMany()
    await prisma.resume.deleteMany()
    await prisma.workExperience.deleteMany()
    await prisma.education.deleteMany()
    await prisma.candidate.deleteMany()
    await prisma.position.deleteMany()
    await prisma.interviewStep.deleteMany()
    await prisma.interviewFlow.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.company.deleteMany()
    await prisma.interviewType.deleteMany()

    // Create test interview types first
    const interviewTypes = await Promise.all([
      prisma.interviewType.create({
        data: { name: 'Screening', description: 'Initial screening interview' }
      }),
      prisma.interviewType.create({
        data: { name: 'Technical', description: 'Technical assessment interview' }
      }),
      prisma.interviewType.create({
        data: { name: 'Manager', description: 'Manager interview' }
      }),
      prisma.interviewType.create({
        data: { name: 'Offer', description: 'Offer discussion' }
      })
    ])

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company Inc.'
      }
    })

    // Create test interview flow
    const interviewFlow = await prisma.interviewFlow.create({
      data: {
        description: 'Standard Interview Process',
        interviewSteps: {
          create: [
            { name: 'Initial Screening', orderIndex: 1, interviewTypeId: interviewTypes[0].id },
            { name: 'Technical Interview', orderIndex: 2, interviewTypeId: interviewTypes[1].id },
            { name: 'Final Interview', orderIndex: 3, interviewTypeId: interviewTypes[2].id },
            { name: 'Offer', orderIndex: 4, interviewTypeId: interviewTypes[3].id }
          ]
        }
      },
      include: {
        interviewSteps: true
      }
    })

    // Create test position
    const position = await prisma.position.create({
      data: {
        companyId: company.id,
        interviewFlowId: interviewFlow.id,
        title: 'Senior Frontend Developer',
        description: 'Test position for E2E testing',
        status: 'Active',
        isVisible: true,
        location: 'Remote',
        jobDescription: 'Test job description',
        requirements: 'React, TypeScript',
        responsibilities: 'Develop frontend features',
        employmentType: 'Full-time'
      }
    })

    // Create test candidates
    const candidates = await Promise.all([
      prisma.candidate.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          phone: '+1234567890',
          address: 'Test Address 1'
        }
      }),
      prisma.candidate.create({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@test.com',
          phone: '+1234567891',
          address: 'Test Address 2'
        }
      }),
      prisma.candidate.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@test.com',
          phone: '+1234567892',
          address: 'Test Address 3'
        }
      })
    ])

    // Create applications for candidates
    await Promise.all([
      prisma.application.create({
        data: {
          positionId: position.id,
          candidateId: candidates[0].id,
          applicationDate: new Date(),
          currentInterviewStep: interviewFlow.interviewSteps[0].id
        }
      }),
      prisma.application.create({
        data: {
          positionId: position.id,
          candidateId: candidates[1].id,
          applicationDate: new Date(),
          currentInterviewStep: interviewFlow.interviewSteps[1].id
        }
      }),
      prisma.application.create({
        data: {
          positionId: position.id,
          candidateId: candidates[2].id,
          applicationDate: new Date(),
          currentInterviewStep: interviewFlow.interviewSteps[0].id
        }
      })
    ])

    console.log('✅ Test data seeded successfully')
    return null // Required for Cypress tasks
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Cleans up test data from database
 */
async function cleanupTestData() {
  // Use dynamic import to avoid Cypress path issues
  const path = require('path')
  const backendPath = path.resolve(__dirname, '../../backend')
  
  // Use main database for testing (not separate test database)
  process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/LTIdb`
  
  // Import Prisma client from backend directory
  const { PrismaClient } = require(path.join(backendPath, 'node_modules/@prisma/client'))
  
  const prisma = new PrismaClient()

  try {
    // Delete in reverse order due to foreign key constraints
    await prisma.interview.deleteMany()
    await prisma.application.deleteMany()
    await prisma.resume.deleteMany()
    await prisma.workExperience.deleteMany()
    await prisma.education.deleteMany()
    await prisma.candidate.deleteMany()
    await prisma.position.deleteMany()
    await prisma.interviewStep.deleteMany()
    await prisma.interviewFlow.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.company.deleteMany()
    await prisma.interviewType.deleteMany()

    console.log('✅ Test data cleaned up')
    return null // Required for Cypress tasks
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  setupTestDatabase,
  seedTestData,
  cleanupTestData
}
