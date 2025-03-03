import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>发生了一个错误</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    backgroundColor: "rgba(255,0,0,0.1)",
    borderRadius: 8,
    margin: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
  errorDetails: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
});
