/**
 * TypeScript definitions for Cypress tests
 * 
 * This file contains type definitions for test data, custom commands,
 * and other TypeScript interfaces used in Cypress tests.
 */

declare namespace Cypress {
  interface Chainable {
    // Custom commands
    loginAsRecruiter(): Chainable<void>
    createTestCandidate(): Chainable<void>
    createTestPosition(): Chainable<void>
    cleanupTestData(): Chainable<void>
    
    // Custom assertions
    shouldHaveDataTestId(value: string): Chainable<void>
    shouldBeVisible(): Chainable<void>
    shouldContainText(text: string): Chainable<void>
  }
}

// Test data interfaces
interface TestCandidate {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
}

interface TestPosition {
  title: string
  description: string
  requirements: string
  location: string
  salaryMin: number
  salaryMax: number
}

interface TestCompany {
  name: string
  description: string
}

// API response interfaces
interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

interface CandidateResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  educations: Education[]
  workExperiences: WorkExperience[]
  resumes: Resume[]
}

interface PositionResponse {
  id: number
  title: string
  description: string
  requirements: string
  location: string
  salaryMin: number
  salaryMax: number
  status: string
  isVisible: boolean
}

// Domain model interfaces (matching backend models)
interface Education {
  id?: number
  institution: string
  title: string
  startDate: Date
  endDate?: Date
  candidateId?: number
}

interface WorkExperience {
  id?: number
  company: string
  position: string
  description: string
  startDate: Date
  endDate?: Date
  candidateId?: number
}

interface Resume {
  id?: number
  filePath: string
  fileType: string
  uploadDate: Date
  candidateId?: number
}
