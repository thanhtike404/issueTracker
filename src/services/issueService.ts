// api/issues.ts
import axios from 'axios';

export const getIssues = async (status?: string, search?: string) => {
    let url = '/api/issues';
    const params: Record<string, string> = {};
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await axios.get(url, { params });
    return response.data;
}

export const getIssueById = async (id: number) => {
    let url = `/api/issues/${id}`;
    const response = await axios.get(url);
    return response.data;
}