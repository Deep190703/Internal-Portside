import { Route, Switch } from 'wouter';
import { InternalSidebar } from './components/InternalSidebar';
import { InternalPortsideDashboard } from './components/InternalPortsideDashboard';
import { AccountAnalyticsPage } from './components/AccountAnalyticsPage';
import { UserDirectoryPage } from './components/UserDirectoryPage';

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', width: '100%' }}>
      {/* Standalone Dark Operations Sidebar */}
      <InternalSidebar />

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <Switch>
          <Route path="/" component={InternalPortsideDashboard} />
          <Route path="/tenants" component={InternalPortsideDashboard} />
          <Route path="/users" component={UserDirectoryPage} />
          <Route path="/analytics" component={AccountAnalyticsPage} />
          <Route path="/team" component={InternalPortsideDashboard} />
          <Route path="/settings" component={InternalPortsideDashboard} />
        </Switch>
      </div>
    </div>
  );
}
