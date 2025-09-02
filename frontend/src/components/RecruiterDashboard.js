import React from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png'; // Ruta actualizada para importar desde src/assets

const RecruiterDashboard = () => {
    return (
        <Container className="mt-5" data-testid="dashboard-container">
            <div className="text-center"> {/* Contenedor para el logo */}
                <img src={logo} alt="LTI Logo" style={{ width: '150px' }} data-testid="lti-logo" />
            </div>
            <h1 className="mb-4 text-center" data-testid="dashboard-title">Dashboard del Reclutador</h1>
            <Row>
                <Col md={6}>
                    <Card className="shadow p-4" data-testid="add-candidate-card">
                        <h5 className="mb-4">Añadir Candidato</h5>
                        <Link to="/add-candidate">
                            <Button variant="primary" className="btn-block" data-testid="add-candidate-btn">Añadir Nuevo Candidato</Button>
                        </Link>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow p-4" data-testid="view-positions-card">
                        <h5 className="mb-4">Ver Posiciones</h5>
                        <Link to="/positions">
                            <Button variant="primary" className="btn-block" data-testid="view-positions-btn">Ir a Posiciones</Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;
