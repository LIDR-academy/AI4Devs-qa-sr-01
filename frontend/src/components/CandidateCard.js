import React from 'react';
import { Card } from 'react-bootstrap';
import { Draggable } from 'react-beautiful-dnd';

const CandidateCard = ({ candidate, index, onClick }) => (
    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
        {(provided) => (
            <Card
                className="mb-2"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={() => onClick(candidate)}
                data-testid={`candidate-card-${candidate.id}`}
            >
                <Card.Body data-testid={`candidate-card-body-${candidate.id}`}>
                    <Card.Title data-testid={`candidate-name-${candidate.id}`}>{candidate.name}</Card.Title>
                    <div data-testid={`candidate-rating-${candidate.id}`}>
                        {Array.from({ length: candidate.rating }).map((_, i) => (
                            <span key={i} role="img" aria-label="rating">🟢</span>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        )}
    </Draggable>
);

export default CandidateCard;
