/// <reference types="cypress" />

/**
 * Configuración centralizada para tests
 * Facilita la extensión y mantenimiento de los tests
 */

// Configuración de timeouts
export const TIMEOUTS = {
  default: 10000,
  api: 15000,
  dragDrop: 5000
}

// Configuración de viewport
export const VIEWPORT = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
}

// Configuración de datos de prueba extensibles
export const EXTENDABLE_TEST_DATA = {
  // Fases del proceso (fácil de extender)
  phases: {
    aplicacionInicial: { id: 0, name: 'Aplicación Inicial', order: 1 },
    screening: { id: 1, name: 'Screening', order: 2 },
    entrevistaTecnica: { id: 2, name: 'Entrevista Técnica', order: 3 },
    entrevistaFinal: { id: 3, name: 'Entrevista Final', order: 4 },
    contratado: { id: 4, name: 'Contratado', order: 5 }
    // Fácil agregar nuevas fases aquí
  },
  
  // Candidatos de prueba (fácil de extender)
  candidates: {
    juan: { 
      id: 1, 
      name: 'Juan Pérez', 
      applicationId: 101, 
      currentStep: 1,
      rating: 8.5,
      email: 'juan.perez@email.com'
    },
    maria: { 
      id: 2, 
      name: 'María García', 
      applicationId: 102, 
      currentStep: 2,
      rating: 9.2,
      email: 'maria.garcia@email.com'
    },
    carlos: { 
      id: 3, 
      name: 'Carlos López', 
      applicationId: 103, 
      currentStep: 3,
      rating: 7.8,
      email: 'carlos.lopez@email.com'
    }
    // Fácil agregar nuevos candidatos aquí
  },
  
  // Posiciones de prueba
  positions: {
    frontend: {
      id: 1,
      title: 'Frontend Developer',
      contactInfo: 'John Doe',
      applicationDeadline: '2024-12-31',
      status: 'Open'
    },
    backend: {
      id: 2,
      title: 'Backend Developer',
      contactInfo: 'Jane Smith',
      applicationDeadline: '2024-11-30',
      status: 'Contratado'
    }
    // Fácil agregar nuevas posiciones aquí
  }
}

// Configuración de selectores CSS (centralizada para fácil mantenimiento)
export const SELECTORS = {
  // Página de posiciones
  positions: {
    title: 'h2',
    card: '.card',
    cardTitle: '.card-title',
    cardBody: '.card-body'
  },
  
  // Página de detalles de posición
  positionDetails: {
    title: 'h2',
    backButton: 'button',
    cardHeader: '.card-header',
    cardBody: '.card-body',
    cardTitle: '.card-title'
  },
  
  // Drag & Drop
  dragDrop: {
    draggable: '[data-rbd-draggable-id]',
    droppable: '[data-rbd-droppable-id]',
    dragHandle: '[data-rbd-drag-handle-draggable-id]'
  }
}

// Configuración de URLs de la API (extensible)
export const API_CONFIG = {
  baseUrl: 'http://localhost:3010',
  endpoints: {
    positions: '/positions',
    positionDetails: (id) => `/positions/${id}`,
    interviewFlow: (id) => `/positions/${id}/interviewFlow`,
    candidates: (id) => `/positions/${id}/candidates`,
    updateCandidate: (id) => `/candidates/${id}`,
    // Fácil agregar nuevos endpoints aquí
    addCandidate: '/candidates',
    deleteCandidate: (id) => `/candidates/${id}`,
    updatePosition: (id) => `/positions/${id}`
  }
}

// Configuración de fixtures (extensible)
export const FIXTURES = {
  positions: 'positions.json',
  interviewFlow: 'interview-flow.json',
  positionCandidates: 'position-candidates.json',
  // Fácil agregar nuevos fixtures aquí
  newCandidate: 'new-candidate.json',
  updatedPosition: 'updated-position.json'
}

// Configuración de respuestas de API estándar
export const API_RESPONSES = {
  success: {
    statusCode: 200,
    body: { success: true }
  },
  error: {
    statusCode: 500,
    body: { 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred'
    }
  },
  notFound: {
    statusCode: 404,
    body: { 
      success: false,
      error: 'Not found',
      message: 'Resource not found'
    }
  }
}

// Funciones de utilidad para configuración
export const CONFIG_UTILS = {
  // Obtener todas las fases en orden
  getPhasesInOrder: () => {
    return Object.values(EXTENDABLE_TEST_DATA.phases)
      .sort((a, b) => a.order - b.order)
  },
  
  // Obtener todos los candidatos
  getAllCandidates: () => {
    return Object.values(EXTENDABLE_TEST_DATA.candidates)
  },
  
  // Obtener fase por ID
  getPhaseById: (id) => {
    return Object.values(EXTENDABLE_TEST_DATA.phases)
      .find(phase => phase.id === id)
  },
  
  // Obtener candidato por ID
  getCandidateById: (id) => {
    return Object.values(EXTENDABLE_TEST_DATA.candidates)
      .find(candidate => candidate.id === id)
  },
  
  // Construir URL completa de API
  buildApiUrl: (endpoint) => {
    return `${API_CONFIG.baseUrl}${endpoint}`
  }
}
