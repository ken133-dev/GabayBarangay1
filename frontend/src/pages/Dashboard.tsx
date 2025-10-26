import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { User } from '@/types/index';
import { UserRole } from '@/types/index';
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  Baby,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/reports/dashboard-stats');
        const apiStats = response.data.stats;
        // Ensure stats is always an array
        if (Array.isArray(apiStats)) {
          setStats(apiStats);
        } else {
          // Use empty array if API returns non-array data
          setStats([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data');
        // Use empty array on error
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="/dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/dashboard">
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.isArray(stats) && stats.map((stat, idx) => {
            const IconComponent = stat.icon || Activity;
            return (
              <Card key={idx} className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                      {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {!Array.isArray(stats) && (
            <div className="col-span-4 text-center py-8">
              <p className="text-muted-foreground">No dashboard data available</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
