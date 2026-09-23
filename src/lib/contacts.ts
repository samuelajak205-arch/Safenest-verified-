import { getAccessToken } from './auth';

export interface GoogleContact {
  resourceName: string;
  etag: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  organization?: string;
}

/**
 * Fetches the user's primary Google Contacts.
 */
export async function fetchGoogleContacts(): Promise<GoogleContact[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please log in.');

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=100';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google Contacts: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return parseConnections(data.connections || []);
}

/**
 * Searches the user's Google Contacts with a query string.
 */
export async function searchGoogleContacts(query: string): Promise<GoogleContact[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please log in.');

  const url = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(query)}&readMask=names,emailAddresses,phoneNumbers,photos,organizations`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search Google Contacts: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return parseConnections(data.results?.map((r: any) => r.person) || []);
}

/**
 * Creates a new contact in Google Contacts (Mutating - requires user confirmation first).
 */
export async function createGoogleContact(contact: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
}): Promise<GoogleContact> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please log in.');

  const url = 'https://people.googleapis.com/v1/people:createContact';
  const body = {
    names: [
      {
        givenName: contact.firstName,
        familyName: contact.lastName,
      },
    ],
    emailAddresses: [
      {
        value: contact.email,
        type: 'home',
      },
    ],
    phoneNumbers: [
      {
        value: contact.phone,
        type: 'mobile',
      },
    ],
    organizations: contact.organization
      ? [
          {
            name: contact.organization,
            title: 'SafeNest Tenant/Landlord',
            type: 'work',
          },
        ]
      : [],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Google Contact: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const parsed = parseConnections([data]);
  return parsed[0];
}

/**
 * Helper to parse People API connections into GoogleContact format
 */
function parseConnections(connections: any[]): GoogleContact[] {
  return connections.map((conn) => {
    const nameObj = conn.names?.[0];
    const emailObj = conn.emailAddresses?.[0];
    const phoneObj = conn.phoneNumbers?.[0];
    const photoObj = conn.photos?.[0];
    const orgObj = conn.organizations?.[0];

    return {
      resourceName: conn.resourceName || '',
      etag: conn.etag || '',
      name: nameObj?.displayName || `${nameObj?.givenName || ''} ${nameObj?.familyName || ''}`.trim() || 'Unnamed Contact',
      email: emailObj?.value || '',
      phone: phoneObj?.value || '',
      photoUrl: photoObj?.url || '',
      organization: orgObj?.name || '',
    };
  });
}
