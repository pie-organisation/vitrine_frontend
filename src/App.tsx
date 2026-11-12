import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/vitrine/Home'
import { Offres as HomeOffres } from './pages/vitrine/Offres'
import { FAQ } from './pages/vitrine/FAQ'
import { Contact as HomeContact } from './pages/vitrine/Contact'
import { CommentCaMarche } from './pages/vitrine/CommentCaMarche'
import { MentionsLegales } from './pages/vitrine/MentionsLegales'
import { Login }                    from './pages/Login'
import { AdminLogin }               from './pages/AdminLogin'
import { Registration }             from './pages/Registration'
import { MotDePasseOublie }         from './pages/MotDePasseOublie'
import { AdminMotDePasseOublie }    from './pages/AdminMotDePasseOublie'
import { ReinitialiserMotDePasse }  from './pages/ReinitialiserMotDePasse'
import { ResetPassword }            from './pages/ResetPassword'
import { NotFound }                 from './pages/NotFound'
import { Signature }                from './pages/Signature'
import { AdminLayout }        from './layouts/AdminLayout'
import { Overview }           from './pages/admin/Overview'
import { Organisations }      from './pages/admin/Organisations'
import { OrganisationDetail } from './pages/admin/OrganisationDetail'
import { Demandes }           from './pages/admin/Demandes'
import { Facturation }        from './pages/admin/Facturation'
import { FactureDetail }      from './pages/admin/FactureDetail'
import { Contrats }           from './pages/admin/Contrats'
import { ContratDetail }      from './pages/admin/ContratDetail'
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
import { Groupes }            from './pages/school/Groupes'
import { GroupeCreate }       from './pages/school/GroupeCreate'
import { GroupeDetail }       from './pages/school/GroupeDetail'
import { GroupeImport }       from './pages/school/GroupeImport'
import { Machines }           from './pages/school/Machines'
import { MachineCreate }      from './pages/school/MachineCreate'
import { MachineDetail }      from './pages/school/MachineDetail'
import { Logiciels }          from './pages/school/Logiciels'
import { FacturationEcole }   from './pages/school/FacturationEcole'
import { Contact }            from './pages/school/Contact'
import { Messages as SchoolMessages } from './pages/school/Messages'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/offres" element={<HomeOffres />} />
          <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<HomeContact />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/login"                       element={<Login />} />
          <Route path="/admin/login"                 element={<AdminLogin />} />
          <Route path="/inscription"                 element={<Registration />} />
          <Route path="/mot-de-passe-oublie"         element={<MotDePasseOublie />} />
          <Route path="/admin/mot-de-passe-oublie"   element={<AdminMotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe"  element={<ReinitialiserMotDePasse />} />
          <Route path="/reset-password"              element={<ResetPassword />} />
          {/* Signature de contrat : lien reçu par e-mail, hors espace connecté */}
          <Route path="/signature/:token"            element={<Signature />} />

          {/* Admin back-office — protected, réservé à l'équipe Cubi */}
          <Route path="/admin" element={<ProtectedRoute allow="cubi"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"              element={<Overview />} />
            <Route path="demandes"              element={<Demandes />} />
            <Route path="organisations"         element={<Organisations />} />
            <Route path="organisations/:id"     element={<OrganisationDetail />} />
            <Route path="facturation"           element={<Facturation />} />
            <Route path="facturation/:id"       element={<FactureDetail />} />
            <Route path="contrats"              element={<Contrats />} />
            <Route path="contrats/:id"          element={<ContratDetail />} />
            <Route path="logs"                  element={<Logs />} />
            <Route path="equipe"                element={<Equipe />} />
            <Route path="offres"                element={<Offres />} />
            <Route path="licences"              element={<Licences />} />
            <Route path="messages"              element={<Messages />} />
            <Route path="analytics"             element={<Analytics />} />
            <Route path="profil"                element={<Profil />} />
          </Route>

          {/* School / Group dashboard — protected, réservé aux admins d'organisation */}
          <Route path="/school" element={<ProtectedRoute allow="ecole"><SchoolLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />}        />
            <Route path="comptes"     element={<Comptes />}          />
            {/* Postes de travail (fonctionnalités de Site-Pie) */}
            <Route path="groupes"                   element={<Groupes />}       />
            <Route path="groupes/nouveau"           element={<GroupeCreate />}  />
            <Route path="groupes/:groupId"          element={<GroupeDetail />}  />
            <Route path="groupes/:groupId/importer" element={<GroupeImport />}  />
            <Route path="machines"                  element={<Machines />}      />
            <Route path="machines/nouvelle"         element={<MachineCreate />} />
            <Route path="machines/:vmid"            element={<MachineDetail />} />
            <Route path="logiciels"                 element={<Logiciels />}     />
            {/* Ancienne page Sessions, remplacée par Machines */}
            <Route path="sessions" element={<Navigate to="/school/machines" replace />} />
            <Route path="facturation" element={<FacturationEcole />} />
            <Route path="messages"    element={<SchoolMessages />}   />
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
