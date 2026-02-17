# IRONCLAD — Gym Management SaaS Frontend

Production-ready React SPA that connects exclusively to an Insforge backend.
No local database. No mock data. Zero service keys on the client.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Insforge URL + anon key

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_INSFORGE_URL` | Your Insforge project URL (e.g. `https://abc.insforge.io`) |
| `VITE_INSFORGE_ANON_KEY` | Insforge public anon key — safe for client use |

> ⚠️ NEVER add `service_role` or secret keys here. Multi-tenancy is enforced by RLS on Insforge.

---

## Pages & Routes

| Route | Component | Role Access |
|---|---|---|
| `/auth/login` | LoginPage | Public |
| `/auth/signup` | SignupPage | Public |
| `/setup-gym` | SetupGymPage | Authenticated |
| `/dashboard` | DashboardPage | gym_owner, staff, admin |
| `/dashboard/members` | MembersPage | gym_owner, staff, admin |
| `/dashboard/trainers` | TrainersPage | gym_owner, admin |
| `/dashboard/plans` | PlansPage | gym_owner, admin |
| `/dashboard/subscriptions` | SubscriptionsPage | gym_owner, admin |
| `/dashboard/payments` | PaymentsPage | gym_owner, admin |
| `/dashboard/attendance` | AttendancePage | gym_owner, staff, admin |
| `/admin/gyms` | AdminGymsPage | admin |
| `/admin/users` | AdminUsersPage | admin |
| `/admin/revenue` | AdminRevenuePage | admin |

---

## API Integration Map

Every form field maps 1:1 to Insforge table columns.

### Auth (Insforge Auth v1)
| Action | Endpoint | Body |
|---|---|---|
| Send OTP | `POST /auth/v1/otp` | `{email}` |
| Verify OTP | `POST /auth/v1/verify` | `{email, token, type:"email"}` |
| Sign Up | `POST /auth/v1/signup` | `{email, password, data:{role}}` |
| Sign In | `POST /auth/v1/token?grant_type=password` | `{email, password}` |
| Sign Out | `POST /auth/v1/logout` | — |
| Refresh | `POST /auth/v1/token?grant_type=refresh_token` | `{refresh_token}` |

### gyms table `{id, name, address}`
| Action | Endpoint |
|---|---|
| List all | `GET /rest/v1/gyms` |
| Create | `POST /rest/v1/gyms` → `{name, address}` |
| Update | `PATCH /rest/v1/gyms?id=eq.{id}` → `{name, address}` |
| Delete | `DELETE /rest/v1/gyms?id=eq.{id}` |

### users table `{id, email, role, gym_id}`
| Action | Endpoint |
|---|---|
| List by gym | `GET /rest/v1/users?gym_id=eq.{gymId}` |
| Update | `PATCH /rest/v1/users?id=eq.{id}` → `{email, role, gym_id}` |
| Delete | `DELETE /rest/v1/users?id=eq.{id}` |

### trainers table `{id, gym_id, name, phone, role}`
| Action | Endpoint |
|---|---|
| List | `GET /rest/v1/trainers?gym_id=eq.{gymId}` |
| Create | `POST /rest/v1/trainers` → `{gym_id, name, phone, role}` |
| Update | `PATCH /rest/v1/trainers?id=eq.{id}` → `{name, phone, role}` |
| Delete | `DELETE /rest/v1/trainers?id=eq.{id}` |

### members table `{id, gym_id, name, phone, plan_id, status}`
| Action | Endpoint |
|---|---|
| List | `GET /rest/v1/members?gym_id=eq.{gymId}` |
| Create | `POST /rest/v1/members` → `{gym_id, name, phone, plan_id, status}` |
| Update | `PATCH /rest/v1/members?id=eq.{id}` → `{name, phone, plan_id, status}` |
| Delete | `DELETE /rest/v1/members?id=eq.{id}` |

### plans table `{id, gym_id, name, price, duration}`
| Action | Endpoint |
|---|---|
| List | `GET /rest/v1/plans?gym_id=eq.{gymId}` |
| Create | `POST /rest/v1/plans` → `{gym_id, name, price, duration}` |
| Update | `PATCH /rest/v1/plans?id=eq.{id}` → `{name, price, duration}` |
| Delete | `DELETE /rest/v1/plans?id=eq.{id}` |

### subscriptions table `{id, gym_id, member_id, plan_id, status, start_date, end_date}`
| Action | Endpoint |
|---|---|
| List | `GET /rest/v1/subscriptions?gym_id=eq.{gymId}` |
| Create | `POST /rest/v1/subscriptions` → `{gym_id, member_id, plan_id, status, start_date, end_date}` |
| Update | `PATCH /rest/v1/subscriptions?id=eq.{id}` → `{member_id, plan_id, status, start_date, end_date}` |
| Delete | `DELETE /rest/v1/subscriptions?id=eq.{id}` |

### payments table `{id, gym_id, member_id, amount, method, status, created_at}`
| Action | Endpoint |
|---|---|
| List | `GET /rest/v1/payments?gym_id=eq.{gymId}&order=created_at.desc` |
| Create | `POST /rest/v1/payments` → `{gym_id, member_id, amount, method, status, created_at}` |
| List all (admin) | `GET /rest/v1/payments?order=created_at.desc` |

### attendance table `{id, gym_id, member_id, date, status}`
| Action | Endpoint |
|---|---|
| List by date | `GET /rest/v1/attendance?gym_id=eq.{gymId}&date=eq.{date}` |
| Create | `POST /rest/v1/attendance` → `{gym_id, member_id, date, status}` |
| Update | `PATCH /rest/v1/attendance?id=eq.{id}` → `{status}` |

---

## Security Model

```
User logs in via Insforge Auth OTP
        ↓
Access token stored in memory (never localStorage)
        ↓
Every request: Authorization: Bearer {token}
        ↓
Insforge RLS policies: gym_id = auth.jwt()→gym_id
        ↓
Zero cross-tenant data leakage
```

### Required Insforge RLS Policies
Add these Row Level Security policies on each table in Insforge:

```sql
-- Example for members table (replicate for all tables)
CREATE POLICY "gym_isolation" ON members
  USING (gym_id = (auth.jwt() ->> 'gym_id')::uuid);

-- Admin bypass
CREATE POLICY "admin_all" ON members
  USING ((auth.jwt() ->> 'role') = 'admin');
```

---

## Deployment

### Netlify
```bash
npm run build
# Deploy dist/ folder
# Add env vars in Netlify Dashboard → Site Settings → Environment Variables
```
`netlify.toml` is pre-configured with SPA redirects.

### Cloudflare Pages
```bash
npm run build
# Build command: npm run build
# Output directory: dist
```
`public/_redirects` is pre-configured.

---

## File Structure

```
src/
├── lib/
│   └── insforge.js        ← All API calls + auth
├── contexts/
│   └── AuthContext.jsx    ← Global auth state
├── hooks/
│   └── useApi.js          ← Data fetching hooks
├── components/
│   ├── ui/index.jsx       ← Design system components
│   └── layout/
│       ├── DashboardLayout.jsx
│       └── ProtectedRoute.jsx
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   └── SignupPage.jsx
    ├── SetupGymPage.jsx
    ├── dashboard/
    │   ├── DashboardPage.jsx
    │   ├── MembersPage.jsx
    │   ├── TrainersPage.jsx
    │   ├── PlansPage.jsx
    │   ├── SubscriptionsPage.jsx
    │   ├── PaymentsPage.jsx
    │   └── AttendancePage.jsx
    └── admin/
        ├── AdminGymsPage.jsx
        ├── AdminUsersPage.jsx
        └── AdminRevenuePage.jsx
```
