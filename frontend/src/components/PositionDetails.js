import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Offcanvas, Button } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import StageColumn from './StageColumn';
import CandidateDetails from './CandidateDetails';
import { useNavigate } from 'react-router-dom';

const PositionsDetails = () => {
    const { id } = useParams();
    const [stages, setStages] = useState([]);
    const [positionName, setPositionName] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInterviewFlow = async () => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/interviewFlow`);
                const data = await response.json();
                const interviewSteps = data.interviewFlow.interviewFlow.interviewSteps.map(step => ({
                    title: step.name,
                    id: step.id,
                    candidates: []
                }));
                setStages(interviewSteps);
                setPositionName(data.interviewFlow.positionName);
            } catch (error) {
                console.error('Error fetching interview flow:', error);
            }
        };

        const fetchCandidates = async () => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/candidates`);
                const candidates = await response.json();
                setStages(prevStages =>
                    prevStages.map(stage => ({
                        ...stage,
                        candidates: candidates
                            .filter(candidate => candidate.currentInterviewStep === stage.title)
                            .map(candidate => ({
                                id: candidate.candidateId.toString(),
                                name: candidate.fullName,
                                rating: candidate.averageScore,
                                applicationId: candidate.applicationId
                            }))
                    }))
                );
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        };

        fetchInterviewFlow();
        fetchCandidates();
    }, [id]);

    const updateCandidateStep = async (candidateId, applicationId, newStep) => {
        try {
            const response = await fetch(`http://localhost:3010/candidates/${candidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicationId: Number(applicationId),
                    currentInterviewStep: Number(newStep)
                })
            });

            if (!response.ok) {
                throw new Error('Error updating candidate step');
            }
        } catch (error) {
            console.error('Error updating candidate step:', error);
        }
    };

    const onDragEnd = (result) => {
        console.log('onDragEnd called with result:', result);
        
        const { source, destination } = result;

        if (!destination) {
            console.log('No destination, returning early');
            return;
        }

        console.log('Source:', source);
        console.log('Destination:', destination);

        // Extraer el ID de la etapa del droppableId (formato: "stage-{id}")
        const sourceStageId = parseInt(source.droppableId.replace('stage-', ''));
        const destStageId = parseInt(destination.droppableId.replace('stage-', ''));
        
        console.log('Source Stage ID:', sourceStageId);
        console.log('Destination Stage ID:', destStageId);
        
        // Encontrar las etapas por ID
        const sourceStageIndex = stages.findIndex(stage => stage.id === sourceStageId);
        const destStageIndex = stages.findIndex(stage => stage.id === destStageId);

        console.log('Source Stage Index:', sourceStageIndex);
        console.log('Destination Stage Index:', destStageIndex);

        if (sourceStageIndex === -1 || destStageIndex === -1) {
            console.log('Invalid stage indices, returning early');
            return;
        }

        // Crear una copia profunda del estado para evitar mutaciones
        const newStages = stages.map(stage => ({
            ...stage,
            candidates: [...stage.candidates]
        }));

        console.log('Moving candidate from source to destination');
        
        // Mover el candidato
        const [movedCandidate] = newStages[sourceStageIndex].candidates.splice(source.index, 1);
        newStages[destStageIndex].candidates.splice(destination.index, 0, movedCandidate);

        console.log('Moved candidate:', movedCandidate);
        console.log('New stages:', newStages);

        // Actualizar el estado
        setStages(newStages);

        // Llamar a la API para actualizar el candidato
        console.log('Calling API to update candidate step');
        updateCandidateStep(movedCandidate.id, movedCandidate.applicationId, destStageId);
    };

    // Exponer la función onDragEnd globalmente para testing
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.onDragEnd = onDragEnd;
        }
        
        return () => {
            if (typeof window !== 'undefined') {
                delete window.onDragEnd;
            }
        };
    }, [stages]);

    const handleCardClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const closeSlide = () => {
        setSelectedCandidate(null);
    };

    return (
        <Container className="mt-5">
            <Button 
                variant="link" 
                onClick={() => navigate('/positions')} 
                className="mb-3"
                data-testid="back-to-positions-button"
            >
                Volver a Posiciones
            </Button>
            <h2 className="text-center mb-4" data-testid="position-title">{positionName}</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Row>
                    {stages.map((stage, index) => (
                        <StageColumn key={index} stage={stage} index={index} onCardClick={handleCardClick} />
                    ))}
                </Row>
            </DragDropContext>
            <CandidateDetails candidate={selectedCandidate} onClose={closeSlide} />
        </Container>
    );
};

export default PositionsDetails;

