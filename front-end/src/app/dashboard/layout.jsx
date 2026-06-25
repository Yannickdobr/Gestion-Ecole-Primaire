import RequireAuth from '@/components/RequireAuth';

export default function DashboardLayout({ children }) {
  // Tout /dashboard/* exige une session connectée
  return (
    <RequireAuth>
      <div style={{ display: 'flex' }}>
        <main style={{ marginLeft: 68, flex: 1 }}>{children}</main>
      </div>
    </RequireAuth>
  );
}