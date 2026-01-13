import { StateGraph, START, END } from '@langchain/langgraph';
import { CouncilStateAnnotation, CouncilState } from './state.js';
import { clarifierNode } from './nodes/clarifier.js';
import { drafterNode } from './nodes/drafter.js';
import { criticNode } from './nodes/critic.js';
import { finalizerNode } from './nodes/finalizer.js';

const MAX_TOKENS_PER_RUN = 50000;

// checkCancellation function will be passed in from worker
export type CheckCancellationFn = (refineryId: string) => Promise<boolean>;

export function createCouncilGraph(checkCancellation: CheckCancellationFn) {
  // Guard node: check cancellation and token budget
  // Routes based on explicit nextNode field
  const guardNode = async (state: CouncilState): Promise<Partial<CouncilState>> => {
    // Check DB for cancellation (not just in-memory flag)
    const isCancelledInDb = await checkCancellation(state.refineryId);
    if (isCancelledInDb) {
      return {
        isCancelled: true,
        error: { phase: 'guard', message: 'Cancelled by user', code: 'CANCELLED' }
      };
    }

    // Check token budget
    if (state.tokensUsed > MAX_TOKENS_PER_RUN) {
      return {
        error: { phase: 'guard', message: 'Token budget exceeded', code: 'BUDGET_EXCEEDED' }
      };
    }

    // Pass through (don't modify state, just check constraints)
    return {};
  };

  // Router function for guard node
  const guardRouter = (state: CouncilState): string => {
    if (state.error) return END;
    return state.nextNode === 'end' ? END : state.nextNode;
  };

  // Router for clarifier (may end if awaiting user)
  const clarifierRouter = (state: CouncilState): string => {
    if (state.error) return END;
    return state.nextNode === 'end' ? END : state.nextNode;
  };

  // Router for critic (may loop back to drafter)
  const criticRouter = (state: CouncilState): string => {
    if (state.error) return END;
    // If critic says revise, go through guard (which will route to drafter)
    return state.nextNode === 'drafter' ? 'guard' : 'finalizer';
  };

  // Build graph using method chaining for proper type inference
  const graph = new StateGraph(CouncilStateAnnotation)
    .addNode('guard', guardNode)
    .addNode('clarifier', clarifierNode)
    .addNode('drafter', drafterNode)
    .addNode('critic', criticNode)
    .addNode('finalizer', finalizerNode)
    // Entry point: START -> guard
    .addEdge(START, 'guard')
    // Guard routes based on nextNode
    .addConditionalEdges('guard', guardRouter)
    // Clarifier routes based on nextNode
    .addConditionalEdges('clarifier', clarifierRouter)
    // Drafter always goes to critic
    .addEdge('drafter', 'critic')
    // Critic may loop or continue
    .addConditionalEdges('critic', criticRouter)
    // Finalizer always ends
    .addEdge('finalizer', END);

  return graph.compile();
}
