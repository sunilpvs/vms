
import axiosInstance from "../../utils/axiosInstance";

export const getActivities = (page, limit, module, username, fromDate, toDate) => {

    const params = new URLSearchParams();

    if (page) params.append("page", page);

    if (limit) params.append("limit", limit);

    if (module) params.append("module", module);

    if (username) params.append("username", username);

    if (fromDate) params.append("fromDate", fromDate);

    if (toDate) params.append("toDate", toDate);

    return axiosInstance.get(`/api/logs/activity?${params.toString()}`);

};
