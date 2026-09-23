export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body?: string;
}

/**
 * Encodes string to base64url safely
 */
function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Lists messages from the user's Gmail account
 */
export async function listGmailMessages(accessToken: string, query = 'SafeNest'): Promise<GmailMessage[]> {
  try {
    const url = `https://gmail.googleapis.com/v1/users/me/messages?maxResults=10&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error listing messages: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.messages) return [];

    // Fetch details for each message
    const detailPromises = data.messages.map((msg: { id: string }) => 
      getGmailMessageDetails(accessToken, msg.id)
    );

    const results = await Promise.all(detailPromises);
    return results.filter((item): item is GmailMessage => item !== null);
  } catch (error) {
    console.error('Error listing Gmail messages:', error);
    return [];
  }
}

/**
 * Fetches message details by ID and parses subject, from, date, snippet
 */
export async function getGmailMessageDetails(accessToken: string, id: string): Promise<GmailMessage | null> {
  try {
    const url = `https://gmail.googleapis.com/v1/users/me/messages/${id}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Parse headers
    const headers = data.payload?.headers || [];
    const subject = headers.find((h: { name: string }) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const from = headers.find((h: { name: string }) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
    const dateValue = headers.find((h: { name: string }) => h.name.toLowerCase() === 'date')?.value || '';
    const date = dateValue ? new Date(dateValue).toLocaleDateString() : 'Unknown Date';

    return {
      id: data.id,
      threadId: data.threadId,
      subject,
      from,
      date,
      snippet: data.snippet || '',
    };
  } catch (error) {
    console.error(`Error fetching message ${id}:`, error);
    return null;
  }
}

/**
 * Sends an email using Gmail REST API send endpoint
 */
export async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    // Standard RFC 822 Email construct
    const emailParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body,
    ];
    
    const emailContent = emailParts.join('\r\n');
    const rawEncoded = encodeBase64Url(emailContent);

    const response = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawEncoded,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gmail Send Error: ${errText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending Gmail email:', error);
    return false;
  }
}
