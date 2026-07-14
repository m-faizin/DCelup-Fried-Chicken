import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'

export const Route = createFileRoute('/app/hq')({
    component: HqGuard,
})

function HqGuard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Jika yang mencoba masuk BUKAN admin pusat, lempar ke kasir
        if (!isLoading && user && user.role !== 'hq_admin') {
            navigate({ to: '/app/outlet', replace: true });
        }
    }, [isLoading, user, navigate]);

    // Tahan halaman (layar kosong sementara) agar tampilan halaman pusat tidak bocor
    if (isLoading || user?.role !== 'hq_admin') return null;

    return <Outlet />;
}