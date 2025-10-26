import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, UserPlus, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import type { Patient } from '@/types/index';

interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  address?: string;
}

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isResident, setIsResident] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [guardianIsResident, setGuardianIsResident] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Resident | null>(null);
  const [guardianSearchQuery, setGuardianSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    address: '',
    contactNumber: '',
    emergencyContact: '',
    guardianName: '',
    birthWeight: '',
    birthLength: '',
    motherName: '',
    fatherName: '',
    placeOfBirth: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchResidents();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await api.get('/admin/users?role=PARENT_RESIDENT&status=ACTIVE');
      setResidents(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch residents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate resident selection if toggle is on
    if (isResident && !selectedResident) {
      toast.error('Please select a resident');
      return;
    }
    
    // Validate required fields for non-residents
    if (!isResident && (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.address || !formData.contactNumber || !formData.emergencyContact)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    let submitData: {
      firstName: string;
      lastName: string;
      middleName?: string;
      dateOfBirth: string;
      gender: string;
      bloodType?: string;
      address: string;
      contactNumber: string;
      emergencyContact: string;
      guardianName?: string;
      birthWeight?: string;
      birthLength?: string;
      motherName?: string;
      fatherName?: string;
      placeOfBirth?: string;
      userId?: string;
      guardianUserId?: string;
    } = { ...formData };
    
    if (isResident && selectedResident) {
      // For residents, use their account information
      submitData = {
        ...submitData,
        firstName: selectedResident.firstName,
        lastName: selectedResident.lastName,
        address: selectedResident.address || '',
        contactNumber: selectedResident.contactNumber || '',
        userId: selectedResident.id // Link to user account
      };
    }

    if (guardianIsResident && selectedGuardian) {
      submitData.guardianUserId = selectedGuardian.id;
      submitData.guardianName = `${selectedGuardian.firstName} ${selectedGuardian.lastName}`;
    }
    
    try {
      await api.post('/health/patients', submitData);
      setShowAddDialog(false);
      resetForm();
      fetchPatients();
      toast.success('Patient added successfully');
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast.error('Failed to add patient');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      address: '',
      contactNumber: '',
      emergencyContact: '',
      guardianName: '',
      birthWeight: '',
      birthLength: '',
      motherName: '',
      fatherName: '',
      placeOfBirth: ''
    });
    setIsResident(false);
    setSelectedResident(null);
    setResidentSearchQuery('');
    setGuardianIsResident(false);
    setSelectedGuardian(null);
    setGuardianSearchQuery('');
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.middleName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout currentPage="Patient Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold">
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Manage patient records and health information
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
                <DialogDescription>
                  Fill in the patient's information to create a new record
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Resident Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Patient Type</Label>
                      <p className="text-sm text-muted-foreground">
                        {isResident ? 'Select from registered residents' : 'Manual entry for non-residents'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="resident-toggle" className="text-sm">
                        {isResident ? 'Resident' : 'Non-Resident'}
                      </Label>
                      <Switch
                        id="resident-toggle"
                        checked={isResident}
                        onCheckedChange={setIsResident}
                      />
                    </div>
                  </div>

                  {isResident ? (
                    /* Resident Selection */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Resident *</Label>
                        <Select
                          value={selectedResident?.id || ''}
                          onValueChange={(value) => {
                            const resident = residents.find(r => r.id === value);
                            setSelectedResident(resident || null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a resident" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search by name or email..."
                                value={residentSearchQuery}
                                onChange={(e) => setResidentSearchQuery(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {residents
                              .filter(resident =>
                                residentSearchQuery === '' ||
                                `${resident.firstName} ${resident.lastName}`.toLowerCase().includes(residentSearchQuery.toLowerCase()) ||
                                (resident.email || '').toLowerCase().includes(residentSearchQuery.toLowerCase())
                              )
                              .map((resident) => (
                                <SelectItem key={resident.id} value={resident.id}>
                                  {resident.firstName} {resident.lastName} - {resident.email}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedResident && (
                        <Card className="p-4 bg-blue-50 border-blue-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium">Name:</Label>
                              <p>{selectedResident.firstName} {selectedResident.lastName}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Email:</Label>
                              <p>{selectedResident.email}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Contact:</Label>
                              <p>{selectedResident.contactNumber || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Address:</Label>
                              <p>{selectedResident.address || 'Not provided'}</p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  ) : (
                    /* Manual Entry Fields */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          value={formData.middleName}
                          onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!isResident && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Complete address"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactNumber">Contact Number *</Label>
                          <Input
                            id="contactNumber"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                            placeholder="+63 XXX XXX XXXX"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                            placeholder="+63 XXX XXX XXXX"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <Label className="text-sm font-medium">Guardian</Label>
                        <p className="text-sm text-muted-foreground">Choose an existing resident guardian or type a name</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="guardian-toggle" className="text-sm">Use Resident</Label>
                        <Switch
                          id="guardian-toggle"
                          checked={guardianIsResident}
                          onCheckedChange={setGuardianIsResident}
                        />
                      </div>
                    </div>

                    {guardianIsResident ? (
                      <div className="space-y-2">
                        <Label>Select Guardian (resident)</Label>
                        <Select
                          value={selectedGuardian?.id || ''}
                          onValueChange={(value) => {
                            const resident = residents.find(r => r.id === value);
                            setSelectedGuardian(resident || null);
                            setFormData(prev => ({ ...prev, guardianName: resident ? `${resident.firstName} ${resident.lastName}` : '' }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a guardian" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search guardian by name or email..."
                                value={guardianSearchQuery}
                                onChange={(e) => setGuardianSearchQuery(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {residents
                              .filter(res =>
                                guardianSearchQuery === '' ||
                                `${res.firstName} ${res.lastName}`.toLowerCase().includes(guardianSearchQuery.toLowerCase()) ||
                                (res.email || '').toLowerCase().includes(guardianSearchQuery.toLowerCase())
                              )
                              .map(res => (
                                <SelectItem key={res.id} value={res.id}>
                                  {res.firstName} {res.lastName} - {res.email}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="guardianName">Guardian Name (if minor)</Label>
                        <Input
                          id="guardianName"
                          value={formData.guardianName}
                          onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                          placeholder="Parent or guardian name"
                        />
                      </div>
                    )}
                  </div>

                  {/* Immunization-specific fields for pediatric patients */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Birth Information (for immunization records)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
                        <Input
                          id="birthWeight"
                          type="number"
                          step="0.1"
                          value={formData.birthWeight}
                          onChange={(e) => setFormData({...formData, birthWeight: e.target.value})}
                          placeholder="e.g., 3.2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthLength">Birth Length (cm)</Label>
                        <Input
                          id="birthLength"
                          type="number"
                          step="0.1"
                          value={formData.birthLength}
                          onChange={(e) => setFormData({...formData, birthLength: e.target.value})}
                          placeholder="e.g., 50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="motherName">Mother's Name</Label>
                        <Input
                          id="motherName"
                          value={formData.motherName}
                          onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                          placeholder="Mother's full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <Input
                          id="fatherName"
                          value={formData.fatherName}
                          onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                          placeholder="Father's full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="placeOfBirth">Place of Birth</Label>
                      <Input
                        id="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})}
                        placeholder="Hospital or city where born"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Register Patient</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Patient Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete patient information and medical history
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-sm">{selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                        <p className="text-sm">{calculateAge(selectedPatient.dateOfBirth)} years old</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                        <p className="text-sm">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                        <p className="text-sm">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Blood Type</Label>
                        <p className="text-sm">{selectedPatient.bloodType || 'Not specified'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">{selectedPatient.address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                        <p className="text-sm">{selectedPatient.contactNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                        <p className="text-sm">{selectedPatient.emergencyContact}</p>
                      </div>
                      {selectedPatient.guardianName && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Guardian</Label>
                          <p className="text-sm">{selectedPatient.guardianName}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                        <p className="text-sm">{selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Medical Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-muted-foreground">Total Appointments</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-muted-foreground">Health Records</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-muted-foreground">Vaccinations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setShowDetailsDialog(false);
                    // Navigate to patient's health records or appointments
                    toast.info('Patient management features coming soon');
                  }}>
                    Manage Patient
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active patient records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New This Month
              </CardTitle>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {patients.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total registered patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Cases
              </CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ongoing treatments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              View and manage all patient information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No patients found matching your search' : 'No patients registered yet'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.firstName} {patient.middleName} {patient.lastName}
                        </TableCell>
                        <TableCell>{calculateAge(patient.dateOfBirth)} yrs</TableCell>
                        <TableCell>
                          <Badge variant={patient.gender === 'Male' ? 'default' : 'secondary'}>
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.bloodType || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{patient.contactNumber}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {patient.address}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(patient)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
