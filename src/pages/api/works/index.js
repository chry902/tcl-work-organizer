import { mockWorks } from '@/lib/mockWorks.js';
import { MOCK_LOGGED_USER } from '@/lib/mockUsers.js';

export async function GET() {
  // Se admin → ritorna tutto
  if (MOCK_LOGGED_USER.role === "admin") {
    return new Response(JSON.stringify(mockWorks), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Se user → ritorna solo i suoi lavori
  const lavoriUtente = mockWorks.filter(
    work => work.utenteId === MOCK_LOGGED_USER.id
  );

  return new Response(JSON.stringify(lavoriUtente), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
