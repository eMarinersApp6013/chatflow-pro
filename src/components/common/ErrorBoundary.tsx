// ErrorBoundary — catches unhandled render errors and shows a recovery screen.
// React error boundaries MUST be class components (no hooks equivalent).
// Wraps the entire app in _layout.tsx so a single screen crash doesn't blank the whole app.

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0b141a' }}>
          <Text style={{ color: '#ea4335', fontSize: 16, marginBottom: 8, fontWeight: '600' }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#8696a0', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
            {this.state.error.message}
          </Text>
          <TouchableOpacity onPress={() => this.setState({ error: null })}>
            <Text style={{ color: '#00a884', fontSize: 14, fontWeight: '600' }}>Tap to try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
