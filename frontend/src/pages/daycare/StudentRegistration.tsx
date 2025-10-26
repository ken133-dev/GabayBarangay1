import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DaycareRegistration } from '@/types/index';

export default function StudentRegistration() {
  const [registrations, setRegistrations] = useState<DaycareRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/daycare/registrations');
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout currentPage="/daycare/registrations">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Daycare Registrations</h1>

        <Card>
          <CardHeader>
            <CardTitle>Registration Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <p className="text-muted-foreground">No registration applications yet.</p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {reg.childFirstName} {reg.childMiddleName} {reg.childLastName}
                        </h3>
                        <p className="text-sm text-gray-600">Gender: {reg.childGender}</p>
                        <p className="text-sm text-gray-600">
                          Date of Birth: {new Date(reg.childDateOfBirth).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Address: {reg.address}</p>
                        <p className="text-sm text-gray-600">Parent Contact: {reg.parentContact}</p>
                        <p className="text-sm text-gray-600">Emergency Contact: {reg.emergencyContact}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Submitted: {new Date(reg.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        reg.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
