# User Flows

## 1. Authentication & Role Management Flow

### User Flow
```
Open Portal → Landing Page → Signup / Login → Enter Credentials → Role-Based Dashboard Redirect
```

### Detailed Paths

#### New User Registration
```
Landing Page → Click "Register" → Registration Form → Submit Details →
Account Pending Approval → Notification Email → Login → Access Appropriate Dashboard
```

#### Existing User Login
```
Landing Page → Click "Login" → Enter Email/Password → System Validates Role →
Redirect to Role-Specific Dashboard
```

#### Password Recovery
```
Login Page → Click "Forgot Password" → Enter Email → Receive Reset Link →
Create New Password → Redirect to Login
```

### Wireframe Pages
- Landing Page (Public)
- Login Screen
- Registration Page
- Forgot Password Page
- Role-Specific Dashboard Pages

---

## 2. Health Services Module Flow

### User Flow (BHW Scheduling Appointment)
```
BHW Dashboard → Click "Health Services" → Patient Management → Select/Add Patient →
Schedule Appointment → Set Date/Type → Confirm → System Sends Notification →
Appointment Appears in Calendar
```

### User Flow (Patient Viewing Records)
```
Patient Dashboard → Click "My Health" → View Appointments → View Health Records →
Access E-Card → Download Certificates
```

### Detailed Paths

#### Add New Patient
```
Health Services → Patient Management → "Add New Patient" → Fill Health Profile →
Save to Database
```

#### Generate Health Report
```
Health Services → Reports → Select Parameters → Generate → Export/Print
```

### Wireframe Pages
- Health Services Dashboard
- Patient Management Page
- Appointment Scheduling Page
- Health Records Page
- Certificate Generator Page
- Vaccination Tracker Page

---

## 3. Daycare Management Flow

### User Flow (Parent Registration)
```
Parent Dashboard → Click "Daycare Services" → Child Registration → Fill Form →
Submit → Await Approval → Receive Confirmation → Access Child's Profile
```

### User Flow (Teacher Management)
```
Teacher Dashboard → Click "Daycare Management" → Attendance → Mark Daily Attendance →
Learning Materials → Upload Content → Progress Reports → Generate Reports
```

### Detailed Paths

#### Attendance Tracking
```
Daycare Management → Attendance → Select Date → Select Class →
Mark Present/Absent → Save
```

#### Progress Reports
```
Daycare Management → Progress Reports → Select Student → Input Assessment →
Generate Report → Share with Parents
```

### Wireframe Pages
- Daycare Registration Page
- Attendance Management Page
- Learning Materials Page
- Progress Report Page
- Certificate Generator Page

---

## 4. SK Engagement Module Flow

### User Flow (SK Officer Creating Event)
```
SK Dashboard → Click "Event Management" → Create Event → Fill Details →
Set Date/Location → Publish → Event Appears on Public Calendar → Notifications Sent
```

### User Flow (Resident Registration)
```
Public Events Page → Browse Events → Select Event → Click "Register" →
Login (if not already) → Confirm Registration → Receive Confirmation →
Add to Personal Calendar
```

### Detailed Paths

#### Attendance Tracking
```
Event Management → Select Event → Attendance → Mark Participants →
Generate Participation Report
```

#### Certificate Generation
```
Event Management → Select Event → Certificates → Generate for Participants →
Download/Bulk Print
```

### Wireframe Pages
- Event Management Page
- Public Events Calendar Page
- Event Registration Page
- Attendance Tracking Page
- Analytics Dashboard Page

---

## 5. Notification System Flow

### User Flow (System Triggered Notification)
```
Event Occurs (Appointment, Event, Announcement) → System Checks User Preferences →
Generates Notification → Delivers via SMS/Email → Appears in User's Notification Center
```

### User Flow (User Managing Preferences)
```
User Dashboard → Click "Notifications" → View Notification Settings →
Adjust Preferences → Save Changes → Future Notifications Follow New Rules
```

### Detailed Paths

#### Broadcast Message
```
Admin Dashboard → Notifications → Broadcast → Compose Message → Select Audience →
Send → Delivery Status Tracking
```

### Wireframe Pages
- Notification Settings Page
- Message Center Page
- Broadcast Message Page (for admins)

---

## 6. Public Portal Flow

### User Flow (Resident Browsing Information)
```
Open Portal → Landing Page → Browse Announcements → View Event Calendar →
Check Service Information → Contact Barangay → (Optional) Register/Login for More Features
```

### Detailed Paths

#### Event Discovery
```
Landing Page → Click "Events" → Filter by Date/Type → View Event Details →
Register (if logged in)
```

### Wireframe Pages
- Homepage (Public)
- Announcements Page
- Events Calendar Page
- About Barangay Page
- Contact Page

---

## 7. Reporting & Analytics Flow

### User Flow (Barangay Captain Generating Report)
```
Admin Dashboard → Click "Reports" → Select Module (Health/Daycare/SK) →
Set Date Range → Choose Report Type → Generate → View Analytics → Export/Print
```

### Detailed Paths

#### Cross-Module Report
```
Reports Dashboard → Consolidated View → Select Multiple Services →
Generate Comparative Analysis → View Dashboard Visualizations
```

### Wireframe Pages
- Reports Dashboard Page
- Report Generator Page
- Analytics View Page

---

## 8. System Administration Flow

### User Flow (Admin Managing Users)
```
Admin Dashboard → Click "User Management" → View User List → Edit User Roles →
Suspend/Activate Accounts → Audit Logs → View System Activity
```

### User Flow (Data Backup)
```
Admin Dashboard → System Settings → Backup Management → Schedule/Initiate Backup →
Monitor Status → Download Backup Files
```

### Detailed Paths

#### Role Management
```
User Management → Select User → Edit Permissions → Assign to Groups → Save Changes
```

### Wireframe Pages
- Admin Dashboard Page
- User Management Page
- System Settings Page
- Backup Management Page

---

## Complete Integrated User Flow Examples

### Example 1: Parent Registering Child for Daycare and SK Event

```
1. Open Portal → Landing Page → Register/Login → Parent Dashboard

2. Click "Daycare Registration" → Fill Form → Submit → Receive Confirmation

3. Browse "Public Events" → Find SK Activity → Register → Receive Event Details

4. Notification Settings → Set Preferences for Daycare & Event Reminders

5. Later: View Child's Progress Reports & Download Participation Certificates
```

### Example 2: BHW Managing Weekly Health Services

```
1. Login → BHW Dashboard → View Today's Appointments

2. Health Services → Add New Patient → Schedule Follow-up

3. Generate Weekly Health Report → Export for Barangay Records

4. Check Notification Center for Urgent Updates

5. System Settings → Backup Today's Data
```

---

## User Flow Diagrams Summary

### Primary User Journeys

| User Type | Primary Actions | Key Touchpoints |
|-----------|----------------|-----------------|
| **Parent/Resident** | Register child, view events, receive notifications | Daycare Registration, Public Events, Notifications |
| **BHW** | Schedule appointments, manage patients, track vaccinations | Patient Management, Scheduling, Health Records |
| **Daycare Staff** | Track attendance, upload materials, generate reports | Attendance, Learning Materials, Progress Reports |
| **SK Officer** | Create events, track attendance, generate certificates | Event Management, Attendance, Analytics |
| **Barangay Captain** | View reports, analyze data, oversee operations | Reports Dashboard, Analytics, Cross-Module Reports |
| **System Admin** | Manage users, configure system, perform backups | User Management, System Settings, Backup |

### Navigation Patterns

#### Public Users (Not Logged In)
```
Landing Page → Public Content → Login/Register → Dashboard
```

#### Authenticated Users
```
Dashboard → Module Selection → Feature Access → Action → Confirmation
```

#### Administrators
```
Admin Dashboard → Management Tools → Configuration → Action → Audit Log
```
