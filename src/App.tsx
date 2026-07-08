import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login }                    from './pages/Login'
import { AdminLogin }               from './pages/AdminLogin'
import { Registration }             from './pages/Registration'
import { MotDePasseOublie }         from './pages/MotDePasseOublie'
import { ReinitialiserMotDePasse }  from './pages/ReinitialiserMotDePasse'
import { ResetPassword }            from './pages/ResetPassword'
import { NotFound }                 from './pages/NotFound'
import { AdminLayout }        from './layouts/AdminLayout'
import { Overview }           from './pages/admin/Overview'
import { Organisations }      from './pages/admin/Organisations'
import { OrganisationDetail } from './pages/admin/OrganisationDetail'
import { Demandes }           from './pages/admin/Demandes'
import { Facturation }        from './pages/admin/Facturation'
import { Logs }               from './pages/admin/Logs'
import { Equipe }             from './pages/admin/Equipe'
import { Offres }             from './pages/admin/Offres'
import { Licences }           from './pages/admin/Licences'
import { Messages }           from './pages/admin/Messages'
import { Analytics }          from './pages/admin/Analytics'
import { Profil }             from './pages/admin/Profil'
import { SchoolLayout }       from './layouts/SchoolLayout'
import { Dashboard }          from './pages/school/Dashboard'
import { Comptes }            from './pages/school/Comptes'
import { Sessions }           from './pages/school/Sessions'
import { FacturationEcole }   from './pages/school/FacturationEcole'
import { Contact }            from './pages/school/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"                       element={<Login />} />
          <Route path="/admin/login"                 element={<AdminLogin />} />
          <Route path="/inscription"                 element={<Registration />} />
          <Route path="/mot-de-passe-oublie"         element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe"  element={<ReinitialiserMotDePasse />} />
          <Route path="/reset-password"              element={<ResetPassword />} />

          {/* Admin back-office — protected, réservé à l'équipe Cubi */}
          <Route path="/admin" element={<ProtectedRoute allow="cubi"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"              element={<Overview />} />
            <Route path="demandes"              element={<Demandes />} />
            <Route path="organisations"         element={<Organisations />} />
            <Route path="organisations/:id"     element={<OrganisationDetail />} />
            <Route path="facturation"           element={<Facturation />} />
            <Route path="logs"                  element={<Logs />} />
            <Route path="equipe"                element={<Equipe />} />
            <Route path="offres"                element={<Offres />} />
            <Route path="licences"              element={<Licences />} />
            <Route path="messages"              element={<Messages />} />
            <Route path="analytics"             element={<Analytics />} />
            <Route path="profil"                element={<Profil />} />
          </Route>

          {/* School / Group dashboard — protected, réservé aux admins d'école */}
          <Route path="/school" element={<ProtectedRoute allow="ecole"><SchoolLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />}        />
            <Route path="comptes"     element={<Comptes />}          />
            <Route path="sessions"    element={<Sessions />}         />
            <Route path="facturation" element={<FacturationEcole />} />
            <Route path="contact"     element={<Contact />}          />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
