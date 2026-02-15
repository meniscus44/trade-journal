import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
            {/* Sidebar (Mobile overlay handling remains in component) */}
            <div className="flex-none h-full overflow-y-auto hidden lg:block border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Sidebar isOpen={true} />
            </div>

            {/* Mobile Sidebar (Absolute/Fixed) */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth">
                {/* Navbar */}
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PageLayout;
