import React from 'react';

const createCircleSegments = (values: { label: string; value: number; color: string }[]) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return values.map((segment, index) => {
    const dashArray = `${circumference * (segment.value / 100)} ${circumference}`;
    const dashOffset = -offset;
    offset += circumference * (segment.value / 100);
    return (
      <circle
        key={segment.label + index}
        r={radius}
        fill="transparent"
        stroke={segment.color}
        strokeWidth="18"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90)"
      />
    );
  });
};

const DonutChart = ({ title, value, segments }: { title: string; value: number | string; segments: { label: string; value: number; color: string }[] }) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
      <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 mb-4">{title}</div>
      <div className="flex flex-col items-center gap-3">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <g transform="translate(70 70)">{createCircleSegments(segments)}</g>
          <circle cx="70" cy="70" r="28" fill="#ffffff" />
          <text x="70" y="68" textAnchor="middle" className="fill-slate-900" style={{ fontSize: '26px', fontWeight: 700 }}>
            {value}
          </text>
          <text x="70" y="88" textAnchor="middle" className="fill-slate-500" style={{ fontSize: '11px' }}>
            %
          </text>
        </svg>
        <div className="w-full space-y-3">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                <span>{segment.label}</span>
              </div>
              <span className="font-semibold text-slate-800">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryAnalysis = () => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="text-xs font-bold uppercase tracking-[0.3em] text-brand-green mb-3">Analyse synthétique</div>
    <p className="text-slate-700 text-sm leading-7">
      Les résultats montrent un niveau d’acceptation extrêmement fort : 100 % des parents estiment l’application utile et sont prêts à l’adopter malgré une légère hausse
      des frais de scolarité. Chez les établissements, l’utilité est également unanimement reconnue, avec une majorité de 75 % déjà favorables à l’adoption.
      Seule une minorité de 25 % des établissements reste réticente, principalement par crainte que les parents n’acceptent pas l’augmentation des frais.
    </p>
  </div>
);

export default function SurveyResults({
  parentsUtility,
  parentsAdoption,
  establishmentsUtility,
  establishmentsAdoption,
  establishmentsReluctant,
}: {
  parentsUtility: number;
  parentsAdoption: number;
  establishmentsUtility: number;
  establishmentsAdoption: number;
  establishmentsReluctant: number;
}) {
  return (
    <section id="results" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-2">Résultats des enquêtes</span>
          <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">Données terrain et perception de l’adoption</h2>
          <p className="text-slate-600 text-sm mt-3 max-w-2xl mx-auto">
            Présentation professionnelle des réponses des parents et des établissements, accompagnée d’une analyse synthétique des tendances observées.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DonutChart
            title="Utilité perçue par les parents"
            value={parentsUtility}
            segments={[
              { label: 'Très utile', value: parentsUtility, color: '#16a34a' },
            ]}
          />
          <DonutChart
            title="Acceptation par les parents malgré les frais"
            value={parentsAdoption}
            segments={[
              { label: 'Prêts à adopter', value: parentsAdoption, color: '#2563eb' },
            ]}
          />
          <DonutChart
            title="Perception de l’utilité par les établissements"
            value={establishmentsUtility}
            segments={[
              { label: 'Utile', value: establishmentsUtility, color: '#0f766e' },
            ]}
          />
          <DonutChart
            title="Position des établissements sur l’adoption"
            value={establishmentsAdoption}
            segments={[
              { label: 'Favorables', value: establishmentsAdoption, color: '#22c55e' },
              { label: 'Réticents', value: establishmentsReluctant, color: '#f59e0b' },
            ]}
          />
        </div>

        <div className="mt-8">
          <SummaryAnalysis />
        </div>
      </div>
    </section>
  );
}
