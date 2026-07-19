import { HashLink } from 'react-router-hash-link'
import { Mail, Phone } from 'lucide-react'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer
      className="mt-24 pt-4 pb-4"
      style={{
        background: 'linear-gradient(180deg, #2a1660 0%, var(--color-cubi-ink) 60%, #170c38 100%)',
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      <div className="container-page py-16 sm:py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10" 
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
      >
        <div>
          <Logo />
          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Un poste de travail puissant pour chaque étudiant, sur n'importe quel ordinateur
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'color-mix(in srgb, var(--color-cubi-mauve) 80%, transparent)' }}>
            Navigation
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-sm">
            <li><HashLink smooth to="/#top" className="no-underline footer-link">Accueil</HashLink></li>
            <li><HashLink smooth to="/offres#top" className="no-underline footer-link">Offres</HashLink></li>
            <li><HashLink smooth to="/comment-ca-marche#top" className="no-underline footer-link">Comment ça marche</HashLink></li>
            <li><HashLink smooth to="/faq#top" className="no-underline footer-link">FAQ</HashLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'color-mix(in srgb, var(--color-cubi-mauve) 80%, transparent)' }}>
            Informations
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-sm">
            <li><HashLink smooth to="/contact#top" className="no-underline footer-link">Contact</HashLink></li>
            <li><HashLink smooth to="/mentions-legales#top" className="no-underline footer-link">Mentions légales</HashLink></li>
            <li><HashLink smooth to="/mentions-legales#cgv" className="no-underline footer-link">CGV</HashLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'color-mix(in srgb, var(--color-cubi-mauve) 80%, transparent)' }}>
            Contact
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-sm">
            <li className="flex items-center gap-2"><Mail size={14} /> contact@cubi.fr</li>
            <li className="flex items-center gap-2"><Phone size={14} /> 01 23 45 67 89</li>
          </ul>
        </div>
      </div>

      <div
        className="py-7"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>© {new Date().getFullYear()} CUBI. Tous droits réservés.</span>
          <span>Fait avec soin, pour rester simple.</span>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: rgba(255,255,255,0.55);
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--color-cubi-mauve);
        }
      `}</style>
    </footer>
  )
}
