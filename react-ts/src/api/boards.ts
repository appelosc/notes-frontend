import {contentApi} from './client';
import type {Board} from '../types';

// getBoards endpoint som returnerar alla boards användaren har rätt till

export const getBoard = () => contentApi<Board[]>('/boards')