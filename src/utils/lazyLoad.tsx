import React, { Suspense, lazy, ComponentType } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

interface LazyOptions {
  /**
   * 是否预加载组件
   * 如果为true，组件将在应用空闲时预加载
   */
  preload?: boolean;
  
  /**
   * 延迟加载时间（毫秒）
   * 可用于控制加载顺序
   */
  delay?: number;
  
  /**
   * 自定义加载组件
   */
  fallback?: React.ReactNode;
  
  /**
   * 加载失败回调
   */
  onError?: (error: Error) => void;
}

/**
 * 默认加载组件
 */
const DefaultLoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0066cc" />
  </View>
);

/**
 * 错误边界组件
 */
class ErrorBoundary extends React.Component<
  { 
    onError?: (error: Error) => void;
    fallback?: React.ReactNode;
    children: React.ReactNode;
  }, 
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("组件加载错误:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
              <View style={styles.errorIcon} />
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>加载失败</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || '组件加载时发生错误'}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * 组件加载器
 * 用于懒加载React组件，同时支持预加载和错误处理
 * 
 * @param importFunc 组件导入函数，返回Promise
 * @param options 加载选项
 * @returns 懒加载的组件
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    preload = false,
    delay = 0,
    fallback = <DefaultLoadingComponent />,
    onError,
  } = options;
  
  // 使用delay实现延迟加载
  const loadComponent = () => {
    return new Promise<{ default: T }>((resolve) => {
      if (delay > 0) {
        setTimeout(() => {
          importFunc().then(resolve);
        }, delay);
      } else {
        importFunc().then(resolve);
      }
    });
  };
  
  // 创建懒加载组件
  const LazyComponent = lazy(loadComponent);
  
  // 如果需要预加载，在空闲时加载组件
  if (preload) {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        loadComponent();
      });
    } else {
      // 回退到setTimeout
      setTimeout(() => {
        loadComponent();
      }, 1000);
    }
  }
  
  // 返回带有Suspense和ErrorBoundary的组件
  return (props: React.ComponentProps<T>) => (
    <ErrorBoundary onError={onError}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * 预加载组件
 * 手动触发组件预加载
 * 
 * @param importFunc 组件导入函数
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  // 在空闲时间预加载
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      importFunc();
    });
  } else {
    // 回退到setTimeout
    setTimeout(() => {
      importFunc();
    }, 500);
  }
}

/**
 * 批量预加载组件
 * 
 * @param importFuncs 组件导入函数数组
 */
export function preloadComponents<T extends ComponentType<any>>(
  importFuncs: Array<() => Promise<{ default: T }>>
): void {
  let index = 0;
  
  const loadNext = () => {
    if (index < importFuncs.length) {
      const currentFunc = importFuncs[index];
      index++;
      
      currentFunc().then(() => {
        // 以50ms的间隔继续加载下一个组件
        setTimeout(loadNext, 50);
      }).catch((error) => {
        console.error("预加载组件失败:", error);
        // 继续加载下一个组件
        setTimeout(loadNext, 50);
      });
    }
  };
  
  // 开始加载
  loadNext();
}

// 样式
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 400,
  },
  errorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f44336',
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
  },
}); 