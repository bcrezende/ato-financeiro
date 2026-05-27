/**
 * Normaliza um telefone para dígitos, removendo código do país (Brasil) e
 * qualquer formatação. Mantém os últimos 11 dígitos (DDD + 9 + número), que é
 * o formato de celular brasileiro. Assim "+55 (47) 99999-8888", "5547999998888"
 * e "47999998888" viram todos "47999998888" — garantindo match consistente
 * entre o que o WhatsApp envia e o que o usuário cadastrou.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return digits || null; // muito curto p/ ser válido, mas devolve o que tem
  return digits.length > 11 ? digits.slice(-11) : digits;
}
