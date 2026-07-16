import React from "react";

export default class HealthCenterErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed:false }; }
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch(error) { console.error("Health Center display error", { name:error?.name, message:error?.message }); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="js-health-error-boundary" role="alert"><h2>We couldn’t display this health check, but your saved garden data is safe.</h2><p>Your draft remains available on this device.</p><div><button type="button" onClick={() => { this.setState({ failed:false }); this.props.onRestore?.(); }}>Restore Draft</button><button type="button" onClick={() => { this.setState({ failed:false }); this.props.onHome?.(); }}>Return to Health Center</button><button type="button" onClick={this.props.onDashboard}>Go to Dashboard</button></div></section>;
  }
}
