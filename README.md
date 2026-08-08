FleetGuard

Fleet Maintenance & Compliance Management System

FleetGuard is a full-stack fleet maintenance and compliance management platform designed to help organizations monitor vehicle compliance, maintenance requirements, driver assignments, and fleet health from a centralized system.

The platform addresses a critical operational problem: vehicles may become non-compliant when insurance, inspection, emissions certification, or maintenance requirements expire without being detected in time.

FleetGuard is designed to make compliance issues visible early and prevent unsafe or non-compliant vehicles from being assigned without an explicit and auditable override.

Table of Contents

Problem Statement

Objectives

Key Features

User Roles

System Architecture

Technology Stack

Project Structure

Core Workflow

Compliance Management

Predictive Maintenance

Notifications

Admin Dashboard

Reports

Security

API Overview

Database Design

Environment Configuration

Local Development Setup

Testing

Git Workflow

Project Phases

Out of Scope

Definition of Done

Future Improvements

Problem Statement

Fleet operators often manage vehicle compliance and maintenance information using spreadsheets maintained across different branches.

This creates several risks:

Compliance documents can expire without timely detection.

Vehicles may be assigned while non-compliant.

Maintenance history can become fragmented.

Service intervals may not be tracked consistently.

Administrators lack a centralized fleet-wide view.

Manual processes make auditing and accountability difficult.

FleetGuard addresses these problems by centralizing vehicle, compliance, maintenance, assignment, notification, and analytics workflows.

Objectives

The primary objectives of FleetGuard are to:

Maintain a centralized vehicle registry.

Track compliance documents independently.

Automatically identify upcoming and expired compliance items.

Prevent non-compliant vehicles from being assigned.

Provide an explicit and auditable assignment override mechanism.

Maintain service and maintenance history.

Provide rule-based predictive maintenance risk indicators.

Notify administrators about important fleet events.

Provide fleet-wide analytics through an administrative dashboard.

Support reporting and export of fleet information.

Key Features

Vehicle Registry

FleetGuard maintains vehicle information including:

VIN

License plate

Make

Model

Year

Vehicle type

Status

Current mileage

Supported vehicle types include:

Truck

Van

Trailer

Car

Compliance Tracking

Each vehicle can have multiple independent compliance records.

Supported compliance categories include:

Insurance

Safety Inspection

Emissions / Pollution Certification

Each compliance item maintains its own:

Document number

Expiration date

Lead time

Status

Verification timestamp

Example:

Vehicle: KA19AB1234

Insurance       → VALID
Inspection      → WARNING
Emissions       → EXPIRED

The vehicle is treated as non-compliant because one of its required documents has expired.

Compliance Status Logic

Expiration Date < Today
        ↓
     EXPIRED

Expiration Date <= Today + Lead Time
        ↓
     WARNING

Otherwise
        ↓
      VALID

A scheduled monitoring process recalculates stale compliance statuses so that a document can become expired even when no user manually opens or edits it.

Assignment Safety

A core FleetGuard business rule is:

A vehicle with an expired compliance document must not be assigned to a driver unless an authorized manager creates an explicit, auditable override.

Workflow:

Select Vehicle
      ↓
Check Compliance
      ↓
Is Vehicle Compliant?
      │
   ┌──┴───┐
  YES     NO
   │       │
   ↓       ↓
Assign   Block
           │
           ↓
      Override Required
           │
           ↓
     Record Reason
           │
           ↓
      Record Approver

Assignment Override

An override represents an authorized manual bypass of the normal assignment restriction.

Example:

Vehicle:
KA19AB1234

Driver:
Rahul

Approved By:
Fleet Manager

Reason:
Original driver unavailable

Timestamp:
2026-08-08 10:30

The override provides:

Accountability

Traceability

Auditability

Operational transparency

Service & Maintenance Management

FleetGuard maintains maintenance history through service records.

Service information includes:

Vehicle

Service type

Service date

Odometer reading

Service center

Mechanic

Cost

Notes

Next service date

Next service mileage

Service intervals can be represented using:

Mileage-based intervals

Time-based intervals

Rule-Based Predictive Maintenance

FleetGuard does not use a trained machine-learning model for predictive maintenance in this sprint.

Instead, it uses a transparent rule-based risk engine.

Current Mileage
       -
Last Service Mileage
       =
Distance Since Last Service

The calculated distance is evaluated against the relevant maintenance threshold.

Risk levels:

LOW
MEDIUM
HIGH

This provides administrators with an explainable maintenance risk signal.

Notifications

The notification service generates in-app alerts based on fleet events.

Examples:

Compliance

Insurance expired

Inspection expired

Emissions certificate expired

Compliance item expiring soon

Maintenance

Service overdue

Maintenance due

Assignment

Assignment override recorded

Severity:

CRITICAL
   ↓
WARNING
   ↓
INFO

External SMS, WhatsApp, and email delivery are outside the current sprint scope.

Admin Dashboard

The Admin Dashboard provides a centralized fleet intelligence view.

Key metrics include:

Total Vehicles

Compliant Vehicles

Expired Vehicles

Upcoming Compliance Expiry

High-Risk Vehicles

Total Maintenance Cost

The dashboard also provides visual analytics for fleet performance.

Fleet Analytics

Dashboard visualizations include:

Compliance Status Distribution

Shows compliant, expired, and upcoming-expiry vehicles.

Fleet Health Score

Displays a calculated percentage representing overall fleet condition.

Predictive Risk Distribution

Shows Low, Medium, and High-risk vehicle counts.

Service Cost Summary

Displays maintenance expenditure information.

Export Reports

Administrators can export fleet information for offline use and reporting.

Supported report categories:

Fleet Metrics

Total vehicles

Compliance statistics

High-risk vehicles

Maintenance cost

Predictive Maintenance Report

Vehicle

Mileage

Service information

Risk level

Maintenance information

Assignment / Override Report

Vehicle

Driver

Approver

Override reason

Date and time

If a report has no records:

No Data Available

Supported formats:

PDF

CSV

User Roles

Admin

Responsible for fleet-wide administration and intelligence.

Typical access:

Fleet analytics

Notifications

Reports

Audit information

Fleet-wide monitoring

Fleet Manager

Responsible for operational fleet management.

Typical responsibilities:

Register vehicles

Monitor compliance

Assign vehicles

Manage operational exceptions

Coordinate maintenance

Driver

Responsible for operating assigned vehicles safely.

Typical responsibilities:

View assigned vehicle

Complete pre-trip checks

Confirm vehicle readiness

Mechanic / Service Center

Responsible for maintenance operations.

Typical responsibilities:

Record services

Update maintenance information

Manage service history

Track maintenance requirements

System Architecture

                    ┌─────────────────────┐
                    │       Browser       │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                             Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Express API      │
                    │     Node.js         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Routes        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Controllers      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Services       │
                    │  Business Logic     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Supabase       │
                    │    PostgreSQL       │
                    │       + Auth        │
                    └─────────────────────┘

Technology Stack

Layer

Technology

Purpose

Frontend

React

Interactive user interface

Build Tool

Vite

Fast development and production builds

Styling

CSS / Tailwind CSS

Responsive UI and dashboard styling

API Communication

Axios

Frontend-to-backend HTTP communication

Backend

Node.js

Server-side JavaScript runtime

API Framework

Express.js

REST API development

Database

PostgreSQL

Relational data storage

Backend Platform

Supabase

PostgreSQL hosting and backend services

Authentication

Supabase Auth

User authentication

Authorization

Express Middleware + Database Roles

Role-based access

Charts

Recharts

Fleet analytics visualization

PDF Export

jsPDF + AutoTable

PDF report generation

CSV Export

PapaParse

CSV report generation

Testing

Jest / Node Test Runner

Automated testing

Version Control

Git

Source control

Repository

GitHub

Team collaboration

Project Structure

fleetguard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── tests/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── migrations/
│
└── README.md

Core Workflow

Register Vehicle
       ↓
Add Compliance Documents
       ↓
Monitor Expiry
       ↓
Generate Alerts
       ↓
Check Compliance Before Assignment
       ↓
Assign Vehicle Safely
       ↓
Perform Service
       ↓
Update Maintenance Record
       ↓
Recalculate Maintenance Risk
       ↓
Update Fleet Analytics

Database Design

FleetGuard uses PostgreSQL through Supabase.

Core entities:

users
  │
  ├── drivers
  ├── fleet managers
  ├── mechanics
  └── admins

vehicles
  │
  ├── compliance_items
  ├── service_logs
  └── assignments
          │
          └── assignment_overrides

users

id
email
full_name
role
phone_number
license_number
license_expiry
status
created_at
updated_at

vehicles

id
vin
license_plate
make
model
year
type
status
current_mileage
created_at
updated_at

compliance_items

id
vehicle_id
document_type
document_number
expiration_date
lead_time_days
status
last_verified_at
created_at
updated_at

service_logs

vehicle_id
service_type_id
service_date
odometer_reading
service_center
mechanic_name
cost
notes
next_service_date
next_service_km

assignments

Connects vehicles with drivers.

assignment_overrides

vehicle_id
driver_id
approved_by
justification
created_at

Authentication & Authorization

FleetGuard uses Supabase Authentication.

Protected API requests use:

Authorization: Bearer <token>

The backend middleware:

Reads the bearer token.

Validates the session with Supabase Auth.

Retrieves the user's application role.

Checks whether the role is allowed.

Allows or rejects the request.

Frontend route guards improve user experience, while backend authorization is the primary security boundary.

Environment Configuration

Create backend/.env:

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-secret
PORT=5000
COMPLIANCE_MONITOR_ENABLED=true

Configure the frontend API URL according to the local backend configuration.

Security: Never commit .env files or service-role keys to GitHub. The service-role key must remain server-side.

Local Development Setup

Prerequisites

Node.js

npm

Git

Supabase project

GitHub access

Clone

git clone <repository-url>
cd fleetguard

Backend

cd backend
npm install
npm start

Default backend:

http://localhost:5000

Health check:

GET http://localhost:5000/health

Expected:

{
  "status": "ok"
}

Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Vite will display the local development URL.

Testing

Run backend tests:

cd backend
npm test

Tests cover important business rules such as:

Compliance status calculation

Expiry monitoring

Input validation

Predictive maintenance rules

Notification logic

Authorization

Build the frontend:

cd frontend
npm run build

API Overview

Method

Endpoint

Purpose

GET

/health

Backend health check

POST

/api/vehicles

Register a vehicle

GET

/api/vehicles

List/filter vehicles

GET

/api/vehicles/:id

Vehicle details

POST

/api/compliance

Create compliance record

PUT

/api/compliance/:id

Update compliance record

GET

/api/admin/metrics

Fleet analytics

GET

/api/admin/predictive-maintenance

Maintenance risk

GET

/api/admin/notifications

Fleet notifications

GET

/api/admin/overrides

Assignment override records

Protected APIs require authentication and role authorization where applicable.

Engineering Principles

Separation of Concerns

Routes
   ↓
Controllers
   ↓
Services
   ↓
Database

Controllers handle HTTP requests and responses, while services contain reusable business logic.

Server-Side Validation

Frontend validation improves usability, but backend validation is required for security and data integrity.

Role-Based Access Control

Permissions are enforced at the API level.

Independent Compliance Rules

Each compliance document has its own expiry date and lead time.

Auditable Exceptions

Safety restrictions can only be bypassed through an explicit and logged override.

Project Phases

Phase 1 — Core Build

Vehicle registry

Compliance tracking

Expiry monitoring

Assignment safety

Service logging

Phase 2 — Change Requests

Potential changes include:

Compliance rules based on vehicle age

Additional approval requirements for assignment overrides

Tiered predictive-maintenance alert routing

Phase 3 — QA & Polish

Bug fixes

QA testing

UI improvements

Performance improvements

Error handling

Final documentation

Out of Scope

The following are explicitly outside the current sprint:

Live government/RTO/DMV compliance integrations

GPS/live vehicle tracking

Trained ML predictive models

Service vendor payments

Invoicing

Multi-company fleet hierarchy

Real SMS delivery

Real WhatsApp delivery

Real email delivery

Predictive maintenance uses rule-based thresholds rather than a trained machine-learning model.

Definition of Done

Every ticket is considered complete only when:

Acceptance criteria are satisfied.

The implementation has been reviewed by another teammate.

The technical trade-off is documented.

AI usage is disclosed where applicable.

Before/after screenshot evidence is provided.

At least one real error and its resolution are documented.

The author does not self-merge the change.

Git Workflow

Create a feature branch:

git switch -c feature/descriptive-name

Check branch:

git branch --show-current

Check changes:

git status

Stage:

git add -A

Commit:

git commit -m "Describe the completed work"

Push:

git push -u origin feature/descriptive-name

Then open a Pull Request for teammate review.

Future Improvements

Potential enhancements include:

Production-grade scheduled jobs

Notification history

Real-time dashboard updates

Advanced fleet reporting

Historical service-cost trends

Improved predictive-maintenance rules

Automated compliance document ingestion

Branch-level fleet management

External notification integrations

Comprehensive integration testing

Database migration and seed management

Project Success Criteria

FleetGuard is successful when the complete operational loop can be demonstrated:

Register Vehicle
      ↓
Track Compliance
      ↓
Assign Safely
      ↓
Perform Service
      ↓
Reset Relevant Maintenance Clock
      ↓
Monitor Fleet Health

The system should demonstrate that:

Compliance requirements are independently tracked.

Expired compliance generates an actionable state.

Non-compliant vehicles cannot be normally assigned.

Exceptional assignments require a logged override.

Maintenance activity updates relevant service information.

Administrators can monitor fleet-wide health.

Important operational events are visible through notifications.

Fleet information can be reviewed and reported.

Team

FleetGuard Development Team

Collaborative responsibilities include:

Frontend Development

Backend Development

Database & Authentication

Fleet Operations / Assignment

Maintenance & Compliance

License

This project was developed as part of a collaborative software engineering build sprint.

Add the appropriate project or institutional license here if required.

FleetGuard — From reactive fleet management to proactive fleet intelligence.
