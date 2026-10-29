import fetcher from './fetcher';

export interface RecentLogin {
  id: number;
  user_name: string;
  user_email: string;
  login_timestamp: string;
}

export interface LoginAnalyticsResponse {
  total_logins_today: number;
  recent_logins: RecentLogin[];
}

export const analyticsApi = {
  getLogins: async () => {
    const response = await fetcher<LoginAnalyticsResponse>('/admin/analytics/logins');
    return response;
  }
};
