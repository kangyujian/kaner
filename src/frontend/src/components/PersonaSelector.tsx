import { PersonaType, PersonaConfig } from '../types';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
}

const personas: PersonaConfig[] = [
  { type: 'gentle', name: '温柔', emoji: '🥰' },
  { type: 'cute', name: '可爱', emoji: '😇' },
  { type: 'playful', name: '调皮', emoji: '😜' },
  { type: 'loli', name: '萝莉', emoji: '👧' },
  { type: '御姐', name: '御姐', emoji: '👩‍🦰' },
];

export const PersonaSelector = ({ selectedPersona, onSelect }: PersonaSelectorProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {personas.map((persona) => (
        <button
          key={persona.type}
          onClick={() => onSelect(persona.type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedPersona === persona.type
              ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg shadow-pink-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-lg">{persona.emoji}</span>
          <span>{persona.name}</span>
        </button>
      ))}
    </div>
  );
};
