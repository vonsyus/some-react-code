const AUTH_TOKEN = 'arsnlAuthToken';

export class AuthClient {
  async getAuthToken(): Promise<string> {
    const token = localStorage.getItem(AUTH_TOKEN);
    if (!token) {
      throw new Error('Token is not present');
    }
    return token;
  }

  async setAuthToken(token: string): Promise<void> {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  async signIn(address: string, signature: string): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        signature
      })
    });

    if (!res.ok) {
      throw new Error('Sign in failed.');
    }
    const { userSessionToken } = await res.json();
    await this.setAuthToken(userSessionToken);
  }

  async check(): Promise<void> {
    const token = await this.getAuthToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/check`, {
      headers: {
        bearer: token
      }
    });
    if (!res.ok) {
      throw new Error('Auth check failed.');
    }
  }

  async signOut(): Promise<void> {
    const token = await this.getAuthToken();
    this.resetAuth();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/signout`, {
      method: 'DELETE',
      headers: {
        bearer: token
      }
    });
    if (!res.ok) {
      throw new Error('Sign out failed.');
    }
  }

  private resetAuth() {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem('wallet_provider');
  }
}
