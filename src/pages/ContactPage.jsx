import { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Nom : ${name}\nEmail : ${email}\n\n${message}`
    );
    window.location.href = `mailto:contact@jobci.ci?subject=${encodeURIComponent(subject)}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Contactez-nous</h1>
          <p className="text-navy-300 text-sm">
            Une question, un partenariat, une offre à publier ? On vous répond rapidement.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Info */}
          <div className="space-y-4">
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              label="Email"
              value="contact@jobci.ci"
              href="mailto:contact@jobci.ci"
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Localisation"
              value="Abidjan, Côte d'Ivoire"
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Disponibilité"
              value="Lun – Ven, 8h – 18h"
            />

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-6">
              <p className="text-sm font-semibold text-orange-700 mb-1">Publier une offre ?</p>
              <p className="text-xs text-orange-600">
                Vous êtes recruteur et souhaitez diffuser vos offres sur JobCI ?
              </p>
              <Link
                to="/inscription"
                className="inline-block mt-3 text-xs font-semibold bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Créer un compte recruteur
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 mb-2">Message envoyé !</h2>
                  <p className="text-sm text-gray-500">Votre client mail s'est ouvert. Nous reviendrons vers vous sous 48h.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-5 text-sm text-orange-500 font-medium hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-navy-900 mb-5">Envoyer un message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Kofi Atta"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="vous@exemple.com"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="Partenariat, question, signalement…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="Décrivez votre demande…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Envoyer le message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, href }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-semibold text-navy-900 hover:text-orange-500 transition-colors">
            {value}
          </a>
        ) : (
          <p className="text-sm font-semibold text-navy-900">{value}</p>
        )}
      </div>
    </div>
  );
}
