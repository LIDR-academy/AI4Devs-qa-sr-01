import React from "react";
import { Col, Card } from "react-bootstrap";
import { Droppable } from "react-beautiful-dnd";
import CandidateCard from "./CandidateCard";

const StageColumn = ({ stage, index, onCardClick }) => (
  <Col
    md={3}
    data-testid={`column-${stage.title.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <Droppable droppableId={`${index}`}>
      {(provided) => (
        <Card
          className="mb-4"
          ref={provided.innerRef}
          {...provided.droppableProps}
          data-testid={`stage-column-${index}`}
        >
          <Card.Header
            className="text-center"
            data-testid={`stage-title-${stage.title
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {stage.title}
          </Card.Header>
          <Card.Body data-testid={`stage-body-${index}`}>
            {stage.candidates.map((candidate, idx) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={idx}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </Card.Body>
        </Card>
      )}
    </Droppable>
  </Col>
);

export default StageColumn;
