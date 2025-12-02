import Header from '../Header';
import Sidebar from '../Sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 pt-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

