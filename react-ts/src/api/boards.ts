import {contentApi} from './client';
import type {Board} from '../types';

export const getBoard = () => contentApi<Board[]>('/boards')