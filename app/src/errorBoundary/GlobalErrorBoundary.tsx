import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import {
  ERROR_STATE_COMPONENTS,
  type ErrorStateType,
} from '../errorStates';
import { insertEvent } from '../db/database';
import type { PadhaiEvent } from '../types/events';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: ErrorStateType | null;
}

export function pickErrorState(
  type: string | null,
  hasError: boolean
): ErrorStateType {
  if (!hasError) return 'crash_recovered';
  if (type && type in ERROR_STATE_COMPONENTS) return type as ErrorStateType;
  return 'crash_recovered';
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: null };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorType: 'crash_recovered' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught UI error:', error?.message);
    const event: PadhaiEvent = {
      schema_version: '1.1',
      event_id: `crash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      profile_id: 'default_profile',
      seq: Date.now(),
      ts: new Date().toISOString(),
      origin: 'device',
      node: 'ERROR',
      action: 'crash_recovered',
      input_hash: 'crash_recovery_hash',
      output: {
        recovered: true,
        source: 'GlobalErrorBoundary',
        stack_suppressed: Boolean(errorInfo?.componentStack),
      },
      network_mode: 'OFFLINE',
      engine_version: '3.1.0',
      pack_hash: 'system_core',
    };

    insertEvent(event).catch((err) => {
      console.warn('Failed to persist crash_recovered event:', err);
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, errorType: null });
  };

  render() {
    if (this.state.hasError) {
      const activeType = pickErrorState(this.state.errorType, this.state.hasError);
      const Comp = ERROR_STATE_COMPONENTS[activeType] || ERROR_STATE_COMPONENTS.crash_recovered;
      return (
        <Comp
          onAction={this.handleReset}
          actionText="ପାଠ ଜାରି ରଖନ୍ତୁ · Continue Learning"
        />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

