// src/components/players/AddPlayerButton.tsx
import { Link } from 'react-router-dom';

export function AddPlayerButton() {
  return (
    <Link
      to="/players/add"
      className="fixed inset-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md shadow-lg hover:bg-[var(--color-primary)]/90 transition-colors"
    >
      Add Player
    </Link>
  );
}
