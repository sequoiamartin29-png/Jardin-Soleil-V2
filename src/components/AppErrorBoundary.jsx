import React from "react";

const LAST_ROUTE_KEY = "jardinSoleilActivePage";

export default class AppErrorBoundary extends React.Component {
  state = { error:null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Jardin Soleil recovered from an application error.", error, info);
  }

  returnHome = () => {
    try {
      localStorage.setItem(LAST_ROUTE_KEY, "Dashboard");
    } catch {
      // Reloading still provides a clean recovery path.
    }
    globalThis.location?.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="js-app-recovery" role="alert">
        <div aria-hidden="true" className="js-app-recovery__crest">JS</div>
        <p>Jardin Soleil</p>
        <h1>The garden needs a quick refresh.</h1>
        <p>Your locally saved garden records have not been cleared. Return to the Dashboard and continue when the app reloads.</p>
        <button type="button" onClick={this.returnHome}>Return to Dashboard</button>
      </main>
    );
  }
}
