import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== "undefined") {
      console.error("[ErrorBoundary]", error, info?.componentStack);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-8">
          <h2 className="text-xl font-bold text-rose-200">
            Something broke while rendering this page.
          </h2>
          <p className="mt-2 text-sm text-rose-100/80">
            {String(this.state.error?.message ?? this.state.error ?? "Unknown error")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={this.reset} className="btn btn-primary">
              Try again
            </button>
            <Link to="/" className="btn btn-secondary">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
