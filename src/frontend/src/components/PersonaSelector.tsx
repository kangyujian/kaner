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
    <div className="flex gap-3 flex-wrap">
      {personas.map((persona) => (
        <button
          key={persona.type}
          onClick={() => onSelect(persona.type)}
          className={`relative flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 transform ${
            selectedPersona === persona.type
              ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white shadow-xl shadow-pink-300/50 scale-105'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-lg hover:scale-102 border border-pink-100'
          }`}
        >
          <span
            className={`text-lg transition-transform duration-300 ${
              selectedPersona === persona.type ? 'float-animation' : ''
            }`}
          >
            {persona.emoji}
          </span>
          <span>{persona.name}</span>
          
          {selectedPersona === persona.type && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs text-pink-500">✓</span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
};