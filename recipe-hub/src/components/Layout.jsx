import Sidebar from './Sidebar'
import BottomNav from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <Sidebar />
      <div className="md:pr-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
