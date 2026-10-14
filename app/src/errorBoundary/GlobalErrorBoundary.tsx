import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { CrashRecoveredState } from '../errorStates/crash_recovered';
import { insertEvent } from '../db/database';
import type { PadhaiEvent } from '../types/events';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
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
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <CrashRecoveredState
          onAction={this.handleReset}
          actionText="ପାଠ ଜାରି ରଖନ୍ତୁ · Continue Learning"
        />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
