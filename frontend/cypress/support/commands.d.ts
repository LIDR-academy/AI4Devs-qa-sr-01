// TypeScript declarations for custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      visitPositionDetail(positionId: number): Chainable<void>;
      waitForPositionDetailToLoad(): Chainable<void>;
      getCandidateCard(candidateName: string): Chainable<JQuery<HTMLElement>>;
      getStageColumn(stageName: string): Chainable<JQuery<HTMLElement>>;
      dragCandidateToStage(candidateName: string, targetStageName: string): Chainable<void>;
      verifyCandidateInStage(candidateName: string, stageName: string): Chainable<void>;
      countCandidatesInStage(stageName: string): Chainable<number>;
      mockPositionDetailAPIs(positionId?: number): Chainable<void>;
      verifyUpdateCandidateAPI(candidateId: number, expectedStepId: number): Chainable<void>;
    }
  }
}

export {};
